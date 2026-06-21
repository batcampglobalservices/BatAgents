const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UsageTracker", function () {
  let mockOracle;
  let batAgentNFT;
  let royalties;
  let accessControl;
  let usageTracker;
  let owner;
  let creator;
  let buyer;
  let nonOwner;
  let backendSigner;

  const name = "Trading Bot";
  const category = "Finance";
  const metadataURI = "ipfs://QmDummyMetadata";
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("metadata"));
  const encryptedDataHash = ethers.keccak256(ethers.toUtf8Bytes("encryptedData"));

  const pricePerDay = ethers.parseEther("0.1");
  const pricePerMessage = ethers.parseEther("0.01");
  const platformFeeBps = 500;

  beforeEach(async function () {
    [owner, creator, buyer, nonOwner, backendSigner] = await ethers.getSigners();

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

    const UsageTracker = await ethers.getContractFactory("UsageTracker");
    usageTracker = await UsageTracker.deploy(
      await accessControl.getAddress(),
      backendSigner.address
    );

    // Set usageTracker address on accessControl
    await accessControl.connect(owner).setUsageTracker(await usageTracker.getAddress());

    // Mint an agent NFT directly
    await batAgentNFT.connect(owner).mintAgent(
      creator.address,
      creator.address,
      name,
      category,
      metadataURI,
      metadataHash,
      encryptedDataHash
    );

    // Approve access control on NFT
    await batAgentNFT.connect(creator).approve(await accessControl.getAddress(), 1);
  });

  describe("Deployment", function () {
    it("deploys with correct parameters", async function () {
      expect(await usageTracker.accessControl()).to.equal(await accessControl.getAddress());
      expect(await usageTracker.backendSigner()).to.equal(backendSigner.address);
    });
  });

  describe("Backend Signer Configuration", function () {
    it("owner can set backend signer address", async function () {
      await expect(usageTracker.connect(owner).setBackendSigner(nonOwner.address))
        .to.emit(usageTracker, "BackendSignerUpdated")
        .withArgs(backendSigner.address, nonOwner.address);
      expect(await usageTracker.backendSigner()).to.equal(nonOwner.address);
    });

    it("non-owner cannot set backend signer", async function () {
      await expect(
        usageTracker.connect(nonOwner).setBackendSigner(creator.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("rejects zero address for backend signer", async function () {
      await expect(
        usageTracker.connect(owner).setBackendSigner(ethers.ZeroAddress)
      ).to.be.revertedWith("UsageTracker: zero backend signer address");
    });
  });

  describe("Usage Recording", function () {
    beforeEach(async function () {
      // Set access terms
      await accessControl.connect(creator).setRentalTerms(1, pricePerDay);
      await accessControl.connect(creator).setMessageTerms(1, pricePerMessage);
    });

    it("reverts if non-backendSigner attempts to record usage", async function () {
      await expect(
        usageTracker.connect(buyer).recordUsage(1, buyer.address, 150)
      ).to.be.revertedWith("UsageTracker: caller is not backend signer");
    });

    it("no-op (does not consume credits) if user is the NFT owner", async function () {
      // NFT Owner (creator) has unlimited access
      await expect(usageTracker.connect(backendSigner).recordUsage(1, creator.address, 150))
        .to.emit(usageTracker, "UsageRecorded")
        .withArgs(1, creator.address, anyTimestamp => anyTimestamp > 0, 150);

      // Verify no message credits consumed
      expect(await accessControl.messageCredits(1, creator.address)).to.equal(0);
    });

    it("no-op (does not consume credits) if user has an active rental", async function () {
      // Buy rental for buyer
      await accessControl.connect(buyer).rent(1, 1, { value: pricePerDay });

      await expect(usageTracker.connect(backendSigner).recordUsage(1, buyer.address, 120))
        .to.emit(usageTracker, "UsageRecorded")
        .withArgs(1, buyer.address, anyTimestamp => anyTimestamp > 0, 120);

      // Verify no message credits consumed (credits are still 0)
      expect(await accessControl.messageCredits(1, buyer.address)).to.equal(0);
    });

    it("consumes message credits if user relies on PPM credits", async function () {
      // Buy message credits
      await accessControl.connect(buyer).payPerMessage(1, 5, { value: pricePerMessage * 5n });
      expect(await accessControl.messageCredits(1, buyer.address)).to.equal(5);

      // Record usage -> consumes 1 credit
      await expect(usageTracker.connect(backendSigner).recordUsage(1, buyer.address, 100))
        .to.emit(usageTracker, "UsageRecorded")
        .withArgs(1, buyer.address, anyTimestamp => anyTimestamp > 0, 100)
        .and.to.emit(accessControl, "MessageCreditConsumed")
        .withArgs(1, buyer.address, 4);

      expect(await accessControl.messageCredits(1, buyer.address)).to.equal(4);
    });

    it("reverts if user relies on PPM but has zero message credits left", async function () {
      // Buyer has no credits and no rental
      await expect(
        usageTracker.connect(backendSigner).recordUsage(1, buyer.address, 100)
      ).to.be.revertedWith("AgentAccessControl: no credits");
    });
  });
});
