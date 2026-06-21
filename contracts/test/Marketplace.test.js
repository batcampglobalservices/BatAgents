const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let mockOracle;
  let batAgentNFT;
  let royalties;
  let marketplace;
  let owner;
  let creator;
  let buyer;
  let nonOwner;

  const name = "Trading Bot";
  const category = "Finance";
  const metadataURI = "ipfs://QmDummyMetadata";
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("metadata"));
  const encryptedDataHash = ethers.keccak256(ethers.toUtf8Bytes("encryptedData"));

  const listPrice = ethers.parseEther("1.0");
  const platformFeeBps = 4000; // 40%
  const monthlyFee = ethers.parseEther("0.05");

  beforeEach(async function () {
    [owner, creator, buyer, nonOwner] = await ethers.getSigners();

    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy();

    const BatAgentNFT = await ethers.getContractFactory("BatAgentNFT");
    batAgentNFT = await BatAgentNFT.deploy(await mockOracle.getAddress());

    const Royalties = await ethers.getContractFactory("Royalties");
    royalties = await Royalties.deploy(platformFeeBps);

    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      await batAgentNFT.getAddress(),
      await royalties.getAddress(),
      await mockOracle.getAddress()
    );

    // Mint an agent NFT directly via owner
    await batAgentNFT.connect(owner).mintAgentWithCreator(
      creator.address,
      creator.address,
      name,
      category,
      metadataURI,
      metadataHash,
      encryptedDataHash
    );

    // Set monthly creator fee
    await marketplace.connect(owner).setMonthlyCreatorFeeWei(monthlyFee);
  });

  describe("Deployment", function () {
    it("deploys with correct parameters", async function () {
      expect(await marketplace.agentNFT()).to.equal(await batAgentNFT.getAddress());
      expect(await marketplace.royalties()).to.equal(await royalties.getAddress());
      expect(await marketplace.oracle()).to.equal(await mockOracle.getAddress());
      expect(await marketplace.monthlyCreatorFeeWei()).to.equal(monthlyFee);
    });
  });

  describe("Oracle Management", function () {
    it("owner can change oracle", async function () {
      await expect(marketplace.connect(owner).setOracle(nonOwner.address))
        .to.emit(marketplace, "OracleUpdated")
        .withArgs(await mockOracle.getAddress(), nonOwner.address);
      expect(await marketplace.oracle()).to.equal(nonOwner.address);
    });

    it("non-owner cannot change oracle", async function () {
      await expect(
        marketplace.connect(nonOwner).setOracle(buyer.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Listing Agents for Buyout", function () {
    it("fails to list if not owner of the token", async function () {
      await expect(
        marketplace.connect(nonOwner).listAgentForBuyout(1, listPrice)
      ).to.be.revertedWith("Marketplace: not owner");
    });

    it("fails to list if price is zero", async function () {
      await expect(
        marketplace.connect(creator).listAgentForBuyout(1, 0)
      ).to.be.revertedWith("Marketplace: price must be greater than zero");
    });

    it("fails to list if Marketplace contract is not approved", async function () {
      await expect(
        marketplace.connect(creator).listAgentForBuyout(1, listPrice)
      ).to.be.revertedWith("Marketplace: contract not approved");
    });

    it("succeeds to list when single-token approved", async function () {
      await batAgentNFT.connect(creator).approve(await marketplace.getAddress(), 1);

      await expect(marketplace.connect(creator).listAgentForBuyout(1, listPrice))
        .to.emit(marketplace, "AgentListed")
        .withArgs(1, creator.address, listPrice, 0);

      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(creator.address);
      expect(listing.price).to.equal(listPrice);
      expect(listing.active).to.be.true;
    });
  });

  describe("Delisting Agents", function () {
    beforeEach(async function () {
      await batAgentNFT.connect(creator).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(creator).listAgentForBuyout(1, listPrice);
    });

    it("seller can delist", async function () {
      await expect(marketplace.connect(creator).delist(1))
        .to.emit(marketplace, "AgentDelisted")
        .withArgs(1);

      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.false;
    });

    it("non-seller cannot delist", async function () {
      await expect(
        marketplace.connect(nonOwner).delist(1)
      ).to.be.revertedWith("Marketplace: not seller");
    });
  });

  describe("Purchasing Agents", function () {
    const sealedKey = ethers.hexlify(ethers.toUtf8Bytes("newSealedKey"));
    const proof = ethers.hexlify(ethers.toUtf8Bytes("reencryptionProof"));
    let proofHash;

    beforeEach(async function () {
      await batAgentNFT.connect(creator).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(creator).listAgentForBuyout(1, listPrice);

      // Approve proof in mock oracle to verify transfer
      proofHash = await mockOracle.hashTransferProof(
        creator.address,
        buyer.address,
        1,
        sealedKey,
        proof
      );
      await mockOracle.connect(owner).approveProof(proofHash);
    });

    it("fails to purchase if listing is not active", async function () {
      await marketplace.connect(creator).delist(1);

      await expect(
        marketplace.connect(buyer).purchase(1, sealedKey, proof, { value: listPrice })
      ).to.be.revertedWith("Marketplace: listing not active");
    });

    it("fails to purchase if payment amount is incorrect", async function () {
      await expect(
        marketplace.connect(buyer).purchase(1, sealedKey, proof, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Marketplace: incorrect payment");
    });

    it("succeeds to purchase: splits payment, records royalty, and transfers token", async function () {
      // Perform purchase
      const tx = await marketplace
        .connect(buyer)
        .purchase(1, sealedKey, proof, { value: listPrice });
      await expect(tx)
        .to.emit(marketplace, "AgentSold")
        .withArgs(1, creator.address, buyer.address, listPrice);

      // 1. Listing should be inactive
      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.false;

      // 2. Token ownership should transfer to buyer
      expect(await batAgentNFT.ownerOf(1)).to.equal(buyer.address);

      // 3. Royalty and Platform splits checked (40% platform, 60% creator)
      const expectedPlatformCut = (listPrice * BigInt(platformFeeBps)) / 10000n;
      const expectedCreatorCut = listPrice - expectedPlatformCut;

      expect(await royalties.pendingBalanceOf(creator.address)).to.equal(expectedCreatorCut);
      expect(await royalties.pendingBalanceOf(owner.address)).to.equal(expectedPlatformCut);
    });
  });

  describe("Creator Subscriptions", function () {
    beforeEach(async function () {
      await batAgentNFT.connect(creator).approve(await marketplace.getAddress(), 1);
    });

    it("fails to pay initial subscription if not owner", async function () {
      await expect(
        marketplace.connect(nonOwner).payInitialAgentSubscription(1, { value: monthlyFee })
      ).to.be.revertedWith("Marketplace: not owner");
    });

    it("fails to pay initial subscription if incorrect fee sent", async function () {
      await expect(
        marketplace.connect(creator).payInitialAgentSubscription(1, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Marketplace: incorrect fee");
    });

    it("succeeds to pay initial subscription and sets 30 days expiry", async function () {
      const tx = await marketplace.connect(creator).payInitialAgentSubscription(1, { value: monthlyFee });
      const currentBlock = await ethers.provider.getBlock(tx.blockNumber);
      const expectedExpiry = BigInt(currentBlock.timestamp) + 30n * 24n * 3600n;

      await expect(tx)
        .to.emit(marketplace, "SubscriptionPaid")
        .withArgs(1, creator.address, expectedExpiry);

      expect(await marketplace.isAgentSubscriptionActive(1)).to.be.true;
      expect(await marketplace.subscriptionExpiresAt(1)).to.equal(expectedExpiry);

      // Subscription fee goes 100% to platform owner
      expect(await royalties.pendingBalanceOf(owner.address)).to.equal(monthlyFee);
    });

    it("fails to pay initial subscription twice", async function () {
      await marketplace.connect(creator).payInitialAgentSubscription(1, { value: monthlyFee });
      await expect(
        marketplace.connect(creator).payInitialAgentSubscription(1, { value: monthlyFee })
      ).to.be.revertedWith("Marketplace: initial subscription already paid");
    });

    it("fails to renew subscription if initial subscription not paid first", async function () {
      await expect(
        marketplace.connect(creator).renewAgentSubscription(1, { value: monthlyFee })
      ).to.be.revertedWith("Marketplace: initial subscription not paid");
    });

    it("creator can renew monthly subscription", async function () {
      await marketplace.connect(creator).payInitialAgentSubscription(1, { value: monthlyFee });
      
      const initialExpiry = await marketplace.subscriptionExpiresAt(1);
      const tx = await marketplace.connect(creator).renewAgentSubscription(1, { value: monthlyFee });
      const expectedExpiry = BigInt(initialExpiry) + 30n * 24n * 3600n;

      await expect(tx)
        .to.emit(marketplace, "SubscriptionPaid")
        .withArgs(1, creator.address, expectedExpiry);

      expect(await marketplace.subscriptionExpiresAt(1)).to.equal(expectedExpiry);
      expect(await royalties.pendingBalanceOf(owner.address)).to.equal(monthlyFee * 2n);
    });
  });

  describe("Agent Hiring", function () {
    const hourlyRateWei = ethers.parseEther("0.1");

    beforeEach(async function () {
      await batAgentNFT.connect(creator).approve(await marketplace.getAddress(), 1);
    });

    it("fails to list if initial monthly fee is not paid / incorrect value sent", async function () {
      await expect(
        marketplace.connect(creator).listAgent(1, hourlyRateWei, { value: 0 })
      ).to.be.revertedWith("Marketplace: incorrect initial subscription fee");
    });

    it("creator pays first monthly fee during listing and lists successfully", async function () {
      const tx = await marketplace.connect(creator).listAgent(1, hourlyRateWei, { value: monthlyFee });
      const currentBlock = await ethers.provider.getBlock(tx.blockNumber);
      const expectedExpiry = BigInt(currentBlock.timestamp) + 30n * 24n * 3600n;

      await expect(tx)
        .to.emit(marketplace, "SubscriptionPaid")
        .withArgs(1, creator.address, expectedExpiry)
        .and.to.emit(marketplace, "AgentListed")
        .withArgs(1, creator.address, 0, hourlyRateWei);

      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.true;
      expect(listing.hourlyRateWei).to.equal(hourlyRateWei);
      expect(await marketplace.isAgentSubscriptionActive(1)).to.be.true;
    });

    it("hiring fails if subscription is not active", async function () {
      // List the agent with active subscription
      await marketplace.connect(creator).listAgent(1, hourlyRateWei, { value: monthlyFee });

      // Fast-forward time by 31 days to expire the subscription
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 3600]);
      await ethers.provider.send("evm_mine");

      // Hiring should now fail
      await expect(
        marketplace.connect(buyer).hireAgent(1, 3600, { value: hourlyRateWei })
      ).to.be.revertedWith("Marketplace: agent subscription expired");
    });

    describe("Active Subscription Hiring", function () {
      beforeEach(async function () {
        await marketplace.connect(creator).listAgent(1, hourlyRateWei, { value: monthlyFee });
      });

      it("fails to hire if duration is below minimum (30 minutes)", async function () {
        await expect(
          marketplace.connect(buyer).hireAgent(1, 29 * 60, { value: 0 })
        ).to.be.revertedWith("Marketplace: duration below minimum");
      });

      it("fails to hire if duration is above maximum (30 days)", async function () {
        const tooLong = 30 * 24 * 3600 + 1;
        await expect(
          marketplace.connect(buyer).hireAgent(1, tooLong, { value: 0 })
        ).to.be.revertedWith("Marketplace: duration exceeds maximum");
      });

      it("fails to hire if payment value is incorrect", async function () {
        await expect(
          marketplace.connect(buyer).hireAgent(1, 3600, { value: 0 })
        ).to.be.revertedWith("Marketplace: incorrect payment");
      });

      it("succeeds to hire: splits payment 40/60, sets hiredUntil, authorizes usage", async function () {
        const duration = 4 * 3600; // 4 hours
        const expectedPayment = hourlyRateWei * 4n;

        const tx = await marketplace.connect(buyer).hireAgent(1, duration, { value: expectedPayment });
        const currentBlock = await ethers.provider.getBlock(tx.blockNumber);
        const expectedAccessExpiry = BigInt(currentBlock.timestamp) + BigInt(duration);

        await expect(tx)
          .to.emit(marketplace, "AgentHired")
          .withArgs(1, buyer.address, duration, expectedPayment)
          .and.to.emit(batAgentNFT, "UsageAuthorized")
          .withArgs(1, creator.address, buyer.address, true);

        expect(await marketplace.hiredUntil(1, buyer.address)).to.equal(expectedAccessExpiry);
        expect(await marketplace.hasAccess(buyer.address, 1)).to.be.true;

        // Check splits (40% platform fee, 60% creator payout)
        // Subscription payment already gave platform owner monthlyFee (0.05 ether).
        // For the hire: platform fee = 0.4 ether * 40% = 0.16 ether.
        // Total platform balance = 0.05 + 0.16 = 0.21 ether.
        // Creator payout = 0.4 ether * 60% = 0.24 ether.
        const expectedPlatformCut = (expectedPayment * 40n) / 100n;
        const expectedCreatorCut = expectedPayment - expectedPlatformCut;

        expect(await royalties.pendingBalanceOf(creator.address)).to.equal(expectedCreatorCut);
        expect(await royalties.pendingBalanceOf(owner.address)).to.equal(monthlyFee + expectedPlatformCut);
      });

      it("extends access when buyer hires again before expiry", async function () {
        const duration1 = 3600; // 1 hour
        const payment1 = hourlyRateWei;

        const tx1 = await marketplace.connect(buyer).hireAgent(1, duration1, { value: payment1 });
        const block1 = await ethers.provider.getBlock(tx1.blockNumber);
        const expiry1 = BigInt(block1.timestamp) + BigInt(duration1);

        expect(await marketplace.hiredUntil(1, buyer.address)).to.equal(expiry1);

        // Hire again
        const duration2 = 2 * 3600; // 2 hours
        const payment2 = hourlyRateWei * 2n;

        await marketplace.connect(buyer).hireAgent(1, duration2, { value: payment2 });
        const expectedExpiry2 = expiry1 + BigInt(duration2);

        expect(await marketplace.hiredUntil(1, buyer.address)).to.equal(expectedExpiry2);
      });
    });
  });
});
