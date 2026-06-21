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
  const platformFeeBps = 500; // 5%

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

    // Transfer Royalties ownership to Marketplace?
    // Wait, Royalties' recordRoyalty does: _pendingBalances[owner()] += platformAmount.
    // The owner of Royalties is `owner` (the deployer). If Marketplace calls `recordRoyalty`, it doesn't need to own it, because recordRoyalty is public!
    // Wait, is recordRoyalty restricted?
    // Let's check Royalties.sol: `function recordRoyalty(address creator) external payable`
    // It has no modifiers! So anyone can call it. That means Marketplace doesn't need ownership to call it.
    
    // Mint an agent NFT directly via owner
    await batAgentNFT.connect(owner).mintAgent(
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
      expect(await marketplace.agentNFT()).to.equal(await batAgentNFT.getAddress());
      expect(await marketplace.royalties()).to.equal(await royalties.getAddress());
      expect(await marketplace.oracle()).to.equal(await mockOracle.getAddress());
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

  describe("Listing Agents", function () {
    it("fails to list if not owner of the token", async function () {
      await expect(
        marketplace.connect(nonOwner).listAgent(1, listPrice)
      ).to.be.revertedWith("Marketplace: not owner");
    });

    it("fails to list if price is zero", async function () {
      await expect(
        marketplace.connect(creator).listAgent(1, 0)
      ).to.be.revertedWith("Marketplace: price must be greater than zero");
    });

    it("fails to list if Marketplace contract is not approved", async function () {
      await expect(
        marketplace.connect(creator).listAgent(1, listPrice)
      ).to.be.revertedWith("Marketplace: contract not approved");
    });

    it("succeeds to list when single-token approved", async function () {
      await batAgentNFT.connect(creator).approve(await marketplace.getAddress(), 1);

      await expect(marketplace.connect(creator).listAgent(1, listPrice))
        .to.emit(marketplace, "AgentListed")
        .withArgs(1, creator.address, listPrice);

      const listing = await marketplace.listings(1);
      expect(listing.seller).to.equal(creator.address);
      expect(listing.price).to.equal(listPrice);
      expect(listing.active).to.be.true;
    });

    it("succeeds to list when operator approved (setApprovalForAll)", async function () {
      await batAgentNFT.connect(creator).setApprovalForAll(await marketplace.getAddress(), true);

      await expect(marketplace.connect(creator).listAgent(1, listPrice))
        .to.emit(marketplace, "AgentListed")
        .withArgs(1, creator.address, listPrice);
    });
  });

  describe("Delisting Agents", function () {
    beforeEach(async function () {
      await batAgentNFT.connect(creator).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(creator).listAgent(1, listPrice);
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

    it("cannot delist an inactive listing", async function () {
      await marketplace.connect(creator).delist(1);
      await expect(
        marketplace.connect(creator).delist(1)
      ).to.be.revertedWith("Marketplace: listing not active");
    });
  });

  describe("Purchasing Agents", function () {
    const sealedKey = ethers.hexlify(ethers.toUtf8Bytes("newSealedKey"));
    const proof = ethers.hexlify(ethers.toUtf8Bytes("reencryptionProof"));
    let proofHash;

    beforeEach(async function () {
      await batAgentNFT.connect(creator).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(creator).listAgent(1, listPrice);

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
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

      // Perform purchase
      const tx = await marketplace
        .connect(buyer)
        .purchase(1, sealedKey, proof, { value: listPrice });
      await expect(tx)
        .to.emit(marketplace, "AgentSold")
        .withArgs(1, creator.address, buyer.address, listPrice)
        .and.to.emit(batAgentNFT, "AgentTransferredWithProof")
        .withArgs(1, creator.address, buyer.address, ethers.keccak256(sealedKey), ethers.keccak256(proof));

      // 1. Listing should be inactive
      const listing = await marketplace.listings(1);
      expect(listing.active).to.be.false;

      // 2. Token ownership should transfer to buyer
      expect(await batAgentNFT.ownerOf(1)).to.equal(buyer.address);

      // 3. Royalty and Platform splits checked
      const expectedPlatformCut = (listPrice * BigInt(platformFeeBps)) / 10000n;
      const expectedCreatorCut = listPrice - expectedPlatformCut;

      expect(await royalties.pendingBalanceOf(creator.address)).to.equal(expectedCreatorCut);
      expect(await royalties.pendingBalanceOf(owner.address)).to.equal(expectedPlatformCut);
    });
  });
});
