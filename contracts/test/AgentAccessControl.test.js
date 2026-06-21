const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentAccessControl", function () {
  let mockOracle;
  let batAgentNFT;
  let royalties;
  let accessControl;
  let owner;
  let creator;
  let buyer;
  let nonOwner;
  let usageTracker;

  const name = "Trading Bot";
  const category = "Finance";
  const metadataURI = "ipfs://QmDummyMetadata";
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("metadata"));
  const encryptedDataHash = ethers.keccak256(ethers.toUtf8Bytes("encryptedData"));

  const pricePerDay = ethers.parseEther("0.1");
  const pricePerMessage = ethers.parseEther("0.01");
  const platformFeeBps = 500;

  beforeEach(async function () {
    [owner, creator, buyer, nonOwner, usageTracker] = await ethers.getSigners();

    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy();

    const BatAgentNFT = await ethers.getContractFactory("BatAgentNFT");
    batAgentNFT = await BatAgentNFT.deploy(await mockOracle.getAddress());

    const Royalties = await ethers.getContractFactory("Royalties");
    royalties = await Royalties.deploy(platformFeeBps);

    const AgentAccessControl = await ethers.getContractFactory("AgentAccessControl");
    accessControl = await AgentAccessControl.deploy(
      await batAgentNFT.getAddress(),
      await royalties.getAddress()
    );

    // Mint an agent NFT directly (creator is the creator and owner)
    await batAgentNFT.connect(owner).mintAgentWithCreator(
      creator.address,
      creator.address,
      name,
      category,
      metadataURI,
      metadataHash,
      encryptedDataHash
    );
  });

  describe("Deployment", function () {
    it("deploys with correct parameters", async function () {
      expect(await accessControl.agentNFT()).to.equal(await batAgentNFT.getAddress());
      expect(await accessControl.royalties()).to.equal(await royalties.getAddress());
      expect(await accessControl.usageTracker()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Usage Tracker Configuration", function () {
    it("owner can set usage tracker address", async function () {
      await expect(accessControl.connect(owner).setUsageTracker(usageTracker.address))
        .to.emit(accessControl, "UsageTrackerUpdated")
        .withArgs(ethers.ZeroAddress, usageTracker.address);
      expect(await accessControl.usageTracker()).to.equal(usageTracker.address);
    });

    it("non-owner cannot set usage tracker", async function () {
      await expect(
        accessControl.connect(nonOwner).setUsageTracker(usageTracker.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("rejects zero address for usage tracker", async function () {
      await expect(
        accessControl.connect(owner).setUsageTracker(ethers.ZeroAddress)
      ).to.be.revertedWith("AgentAccessControl: zero usage tracker address");
    });
  });

  describe("Access Terms Configuration", function () {
    it("only NFT owner can set rental terms", async function () {
      await expect(accessControl.connect(creator).setRentalTerms(1, pricePerDay))
        .to.emit(accessControl, "RentalTermsUpdated")
        .withArgs(1, pricePerDay);

      const terms = await accessControl.rentalTerms(1);
      expect(terms).to.equal(pricePerDay);
    });

    it("non-owner of NFT cannot set rental terms", async function () {
      await expect(
        accessControl.connect(nonOwner).setRentalTerms(1, pricePerDay)
      ).to.be.revertedWith("AgentAccessControl: not owner");
    });

    it("only NFT owner can set message terms", async function () {
      await expect(accessControl.connect(creator).setMessageTerms(1, pricePerMessage))
        .to.emit(accessControl, "MessageTermsUpdated")
        .withArgs(1, pricePerMessage);

      const terms = await accessControl.messageTerms(1);
      expect(terms).to.equal(pricePerMessage);
    });

    it("non-owner of NFT cannot set message terms", async function () {
      await expect(
        accessControl.connect(nonOwner).setMessageTerms(1, pricePerMessage)
      ).to.be.revertedWith("AgentAccessControl: not owner");
    });
  });

  describe("Rental Purchasing", function () {
    beforeEach(async function () {
      await accessControl.connect(creator).setRentalTerms(1, pricePerDay);
    });

    it("fails to rent if terms pricePerDay is zero", async function () {
      // Create new NFT (id = 2) with no terms set
      await batAgentNFT.connect(owner).mintAgentWithCreator(
        creator.address,
        creator.address,
        name,
        category,
        metadataURI,
        metadataHash,
        encryptedDataHash
      );

      await expect(
        accessControl.connect(buyer).rent(2, 5, { value: pricePerDay * 5n })
      ).to.be.revertedWith("AgentAccessControl: rental not available");
    });

    it("fails to rent if days_ is zero", async function () {
      await expect(
        accessControl.connect(buyer).rent(1, 0, { value: 0 })
      ).to.be.revertedWith("AgentAccessControl: invalid days");
    });

    it("fails to rent if payment value is incorrect", async function () {
      await expect(
        accessControl.connect(buyer).rent(1, 3, { value: pricePerDay }) // Paying for 1 day instead of 3
      ).to.be.revertedWith("AgentAccessControl: incorrect payment");
    });

    it("fails to rent if access control contract is not approved by NFT owner", async function () {
      await expect(
        accessControl.connect(buyer).rent(1, 3, { value: pricePerDay * 3n })
      ).to.be.revertedWith("BatAgentNFT: caller is not owner or approved");
    });

    it("succeeds to rent: splits payment, sets rentedUntil, authorizes usage, emits event", async function () {
      // NFT Owner must approve access control contract to manage authorization
      await batAgentNFT.connect(creator).approve(await accessControl.getAddress(), 1);

      const daysCount = 3n;
      const paymentValue = pricePerDay * daysCount;

      const tx = await accessControl.connect(buyer).rent(1, daysCount, { value: paymentValue });
      const currentBlock = await ethers.provider.getBlock(tx.blockNumber);
      const expectedExpiry = BigInt(currentBlock.timestamp) + daysCount * 24n * 3600n;

      await expect(tx)
        .to.emit(accessControl, "RentalPurchased")
        .withArgs(1, buyer.address, expectedExpiry)
        .and.to.emit(batAgentNFT, "UsageAuthorized")
        .withArgs(1, creator.address, buyer.address, true);

      expect(await accessControl.rentedUntil(1, buyer.address)).to.equal(expectedExpiry);
      expect(await batAgentNFT.isUsageAuthorized(1, buyer.address)).to.be.true;

      // Check royalties split
      const expectedPlatformCut = (paymentValue * BigInt(platformFeeBps)) / 10000n;
      const expectedCreatorCut = paymentValue - expectedPlatformCut;
      expect(await royalties.pendingBalanceOf(creator.address)).to.equal(expectedCreatorCut);
      expect(await royalties.pendingBalanceOf(owner.address)).to.equal(expectedPlatformCut);
    });

    it("extends active rental appropriately", async function () {
      await batAgentNFT.connect(creator).approve(await accessControl.getAddress(), 1);

      // First rental
      await accessControl.connect(buyer).rent(1, 2, { value: pricePerDay * 2n });
      const expiry1 = await accessControl.rentedUntil(1, buyer.address);

      // Second rental extending the first
      await accessControl.connect(buyer).rent(1, 3, { value: pricePerDay * 3n });
      const expiry2 = await accessControl.rentedUntil(1, buyer.address);

      const expectedExpiry = expiry1 + 3n * 24n * 3600n;
      expect(expiry2).to.equal(expectedExpiry);
    });
  });

  describe("Pay-Per-Message Purchasing", function () {
    beforeEach(async function () {
      await accessControl.connect(creator).setMessageTerms(1, pricePerMessage);
    });

    it("fails to buy messages if terms pricePerMessage is zero", async function () {
      // Create new NFT (id = 2) with no terms set
      await batAgentNFT.connect(owner).mintAgentWithCreator(
        creator.address,
        creator.address,
        name,
        category,
        metadataURI,
        metadataHash,
        encryptedDataHash
      );

      await expect(
        accessControl.connect(buyer).payPerMessage(2, 10, { value: pricePerMessage * 10n })
      ).to.be.revertedWith("AgentAccessControl: PPM not available");
    });

    it("fails to buy messages if messageCount is zero", async function () {
      await expect(
        accessControl.connect(buyer).payPerMessage(1, 0, { value: 0 })
      ).to.be.revertedWith("AgentAccessControl: invalid message count");
    });

    it("fails to buy messages if payment is incorrect", async function () {
      await expect(
        accessControl.connect(buyer).payPerMessage(1, 10, { value: pricePerMessage })
      ).to.be.revertedWith("AgentAccessControl: incorrect payment");
    });

    it("succeeds to purchase message credits: splits royalties, updates credits, authorizes usage", async function () {
      await batAgentNFT.connect(creator).approve(await accessControl.getAddress(), 1);

      const msgCount = 10n;
      const paymentValue = pricePerMessage * msgCount;

      await expect(accessControl.connect(buyer).payPerMessage(1, msgCount, { value: paymentValue }))
        .to.emit(accessControl, "MessageCreditsPurchased")
        .withArgs(1, buyer.address, msgCount)
        .and.to.emit(batAgentNFT, "UsageAuthorized")
        .withArgs(1, creator.address, buyer.address, true);

      expect(await accessControl.messageCredits(1, buyer.address)).to.equal(msgCount);
      expect(await batAgentNFT.isUsageAuthorized(1, buyer.address)).to.be.true;

      // Check royalties split
      const expectedPlatformCut = (paymentValue * BigInt(platformFeeBps)) / 10000n;
      const expectedCreatorCut = paymentValue - expectedPlatformCut;
      expect(await royalties.pendingBalanceOf(creator.address)).to.equal(expectedCreatorCut);
      expect(await royalties.pendingBalanceOf(owner.address)).to.equal(expectedPlatformCut);
    });
  });

  describe("Message Credit Consumption", function () {
    beforeEach(async function () {
      await accessControl.connect(owner).setUsageTracker(usageTracker.address);
      await accessControl.connect(creator).setMessageTerms(1, pricePerMessage);
      await batAgentNFT.connect(creator).approve(await accessControl.getAddress(), 1);
      await accessControl.connect(buyer).payPerMessage(1, 2, { value: pricePerMessage * 2n });
    });

    it("reverts if non-UsageTracker caller attempts to consume credit", async function () {
      await expect(
        accessControl.connect(buyer).consumeMessageCredit(1, buyer.address)
      ).to.be.revertedWith("AgentAccessControl: not usage tracker");
    });

    it("UsageTracker can consume credit and decrement balance", async function () {
      await expect(accessControl.connect(usageTracker).consumeMessageCredit(1, buyer.address))
        .to.emit(accessControl, "MessageCreditConsumed")
        .withArgs(1, buyer.address, 1);

      expect(await accessControl.messageCredits(1, buyer.address)).to.equal(1);
    });

    it("revokes usage authorization on NFT once credits reach zero (and no active rental)", async function () {
      // First credit consumption (1 credit left)
      await accessControl.connect(usageTracker).consumeMessageCredit(1, buyer.address);
      expect(await batAgentNFT.isUsageAuthorized(1, buyer.address)).to.be.true;

      // Second credit consumption (0 credits left)
      await expect(accessControl.connect(usageTracker).consumeMessageCredit(1, buyer.address))
        .to.emit(batAgentNFT, "UsageAuthorized")
        .withArgs(1, creator.address, buyer.address, false);

      expect(await accessControl.messageCredits(1, buyer.address)).to.equal(0);
      expect(await batAgentNFT.isUsageAuthorized(1, buyer.address)).to.be.false;
    });

    it("does not revoke authorization if buyer has active rental despite credits reaching zero", async function () {
      await accessControl.connect(creator).setRentalTerms(1, pricePerDay);
      await accessControl.connect(buyer).rent(1, 1, { value: pricePerDay });

      // Consume first credit
      await accessControl.connect(usageTracker).consumeMessageCredit(1, buyer.address);
      // Consume second credit (0 credits left)
      await accessControl.connect(usageTracker).consumeMessageCredit(1, buyer.address);

      expect(await accessControl.messageCredits(1, buyer.address)).to.equal(0);
      // Since buyer has active rental, NFT authorization remains true!
      expect(await batAgentNFT.isUsageAuthorized(1, buyer.address)).to.be.true;
    });

    it("reverts if message credit is zero", async function () {
      await accessControl.connect(usageTracker).consumeMessageCredit(1, buyer.address);
      await accessControl.connect(usageTracker).consumeMessageCredit(1, buyer.address);

      await expect(
        accessControl.connect(usageTracker).consumeMessageCredit(1, buyer.address)
      ).to.be.revertedWith("AgentAccessControl: no credits");
    });
  });

  describe("Access Checks (hasAccess)", function () {
    it("owner always has access", async function () {
      expect(await accessControl.hasAccess(creator.address, 1)).to.be.true;
    });

    it("returns false if user has no rental or credits", async function () {
      expect(await accessControl.hasAccess(buyer.address, 1)).to.be.false;
    });

    it("returns true if user has active rental", async function () {
      await accessControl.connect(creator).setRentalTerms(1, pricePerDay);
      await batAgentNFT.connect(creator).approve(await accessControl.getAddress(), 1);
      await accessControl.connect(buyer).rent(1, 1, { value: pricePerDay });

      expect(await accessControl.hasAccess(buyer.address, 1)).to.be.true;
    });

    it("returns true if user has message credits", async function () {
      await accessControl.connect(creator).setMessageTerms(1, pricePerMessage);
      await batAgentNFT.connect(creator).approve(await accessControl.getAddress(), 1);
      await accessControl.connect(buyer).payPerMessage(1, 5, { value: pricePerMessage * 5n });

      expect(await accessControl.hasAccess(buyer.address, 1)).to.be.true;
    });

    it("returns false after rental expires and credits are zero", async function () {
      await accessControl.connect(creator).setRentalTerms(1, pricePerDay);
      await batAgentNFT.connect(creator).approve(await accessControl.getAddress(), 1);
      // Rent for 1 day
      await accessControl.connect(buyer).rent(1, 1, { value: pricePerDay });

      // Fast forward time by 2 days (172800 seconds)
      await ethers.provider.send("evm_increaseTime", [172800]);
      await ethers.provider.send("evm_mine");

      expect(await accessControl.hasAccess(buyer.address, 1)).to.be.false;
    });
  });
});
