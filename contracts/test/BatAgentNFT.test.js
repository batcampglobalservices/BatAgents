const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BatAgentNFT", function () {
  let mockOracle;
  let batAgentNFT;
  let owner;
  let creator;
  let buyer;
  let nonOwner;
  let operator;
  let executor;

  const name = "Trading Bot";
  const category = "Finance";
  const metadataURI = "ipfs://QmDummyMetadata";
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("metadata"));
  const encryptedDataHash = ethers.keccak256(ethers.toUtf8Bytes("encryptedData"));

  beforeEach(async function () {
    [owner, creator, buyer, nonOwner, operator, executor] = await ethers.getSigners();

    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy();

    const BatAgentNFT = await ethers.getContractFactory("BatAgentNFT");
    batAgentNFT = await BatAgentNFT.deploy(await mockOracle.getAddress());
  });

  describe("Deployment", function () {
    it("deploys correctly with valid oracle", async function () {
      expect(await batAgentNFT.transferOracle()).to.equal(await mockOracle.getAddress());
    });

    it("rejects zero oracle in constructor", async function () {
      const BatAgentNFT = await ethers.getContractFactory("BatAgentNFT");
      await expect(BatAgentNFT.deploy(ethers.ZeroAddress)).to.be.revertedWith(
        "BatAgentNFT: zero oracle address"
      );
    });
  });

  describe("Minting", function () {
    it("mints an agent successfully and emits event", async function () {
      await expect(
        batAgentNFT
          .connect(creator)
          .mintAgent(buyer.address, name, category, metadataURI, metadataHash, encryptedDataHash)
      )
        .to.emit(batAgentNFT, "AgentMinted")
        .withArgs(1, creator.address, name, category, metadataURI, metadataHash, encryptedDataHash);

      expect(await batAgentNFT.ownerOf(1)).to.equal(buyer.address);
      expect(await batAgentNFT.exists(1)).to.be.true;
    });

    it("stores creator, name, category, metadata URI, metadata hash, encrypted data hash, active status, and timestamp", async function () {
      await batAgentNFT
        .connect(creator)
        .mintAgent(buyer.address, name, category, metadataURI, metadataHash, encryptedDataHash);

      const agent = await batAgentNFT.getAgent(1);
      expect(agent.creator).to.equal(creator.address);
      expect(agent.name).to.equal(name);
      expect(agent.category).to.equal(category);
      expect(agent.metadataURI).to.equal(metadataURI);
      expect(agent.metadataHash).to.equal(metadataHash);
      expect(agent.encryptedDataHash).to.equal(encryptedDataHash);
      expect(agent.active).to.be.true;
      expect(agent.createdAt).to.be.gt(0);
    });

    it("tokenURI returns the metadata URI", async function () {
      await batAgentNFT
        .connect(creator)
        .mintAgent(buyer.address, name, category, metadataURI, metadataHash, encryptedDataHash);

      expect(await batAgentNFT.tokenURI(1)).to.equal(metadataURI);
    });

    it("rejects minting to zero address", async function () {
      await expect(
        batAgentNFT
          .connect(creator)
          .mintAgent(
            ethers.ZeroAddress,
            name,
            category,
            metadataURI,
            metadataHash,
            encryptedDataHash
          )
      ).to.be.revertedWith("BatAgentNFT: mint to zero address");
    });

    it("rejects empty name", async function () {
      await expect(
        batAgentNFT
          .connect(creator)
          .mintAgent(buyer.address, "", category, metadataURI, metadataHash, encryptedDataHash)
      ).to.be.revertedWith("BatAgentNFT: empty name");
    });

    it("rejects empty category", async function () {
      await expect(
        batAgentNFT
          .connect(creator)
          .mintAgent(buyer.address, name, "", metadataURI, metadataHash, encryptedDataHash)
      ).to.be.revertedWith("BatAgentNFT: empty category");
    });

    it("rejects empty metadata URI", async function () {
      await expect(
        batAgentNFT
          .connect(creator)
          .mintAgent(buyer.address, name, category, "", metadataHash, encryptedDataHash)
      ).to.be.revertedWith("BatAgentNFT: empty metadata URI");
    });

    it("rejects zero metadata hash", async function () {
      await expect(
        batAgentNFT
          .connect(creator)
          .mintAgent(buyer.address, name, category, metadataURI, ethers.ZeroHash, encryptedDataHash)
      ).to.be.revertedWith("BatAgentNFT: zero metadata hash");
    });

    it("rejects zero encrypted data hash", async function () {
      await expect(
        batAgentNFT
          .connect(creator)
          .mintAgent(buyer.address, name, category, metadataURI, metadataHash, ethers.ZeroHash)
      ).to.be.revertedWith("BatAgentNFT: zero encrypted data hash");
    });
  });

  describe("Oracle Management", function () {
    it("only owner can update transfer oracle", async function () {
      const MockOracle = await ethers.getContractFactory("MockOracle");
      const newMockOracle = await MockOracle.deploy();
      const newOracleAddr = await newMockOracle.getAddress();

      await expect(batAgentNFT.connect(owner).setTransferOracle(newOracleAddr))
        .to.emit(batAgentNFT, "TransferOracleUpdated")
        .withArgs(await mockOracle.getAddress(), newOracleAddr);

      expect(await batAgentNFT.transferOracle()).to.equal(newOracleAddr);
    });

    it("non-owner cannot update transfer oracle", async function () {
      const MockOracle = await ethers.getContractFactory("MockOracle");
      const newMockOracle = await MockOracle.deploy();
      const newOracleAddr = await newMockOracle.getAddress();

      await expect(
        batAgentNFT.connect(nonOwner).setTransferOracle(newOracleAddr)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("rejects zero oracle update", async function () {
      await expect(batAgentNFT.connect(owner).setTransferOracle(ethers.ZeroAddress)).to.be.revertedWith(
        "BatAgentNFT: zero oracle address"
      );
    });
  });

  describe("Active Status", function () {
    beforeEach(async function () {
      await batAgentNFT
        .connect(creator)
        .mintAgent(buyer.address, name, category, metadataURI, metadataHash, encryptedDataHash);
    });

    it("owner can set active status", async function () {
      await expect(batAgentNFT.connect(buyer).setAgentActive(1, false))
        .to.emit(batAgentNFT, "AgentStatusUpdated")
        .withArgs(1, false);

      const agent = await batAgentNFT.getAgent(1);
      expect(agent.active).to.be.false;
    });

    it("approved operator can set active status", async function () {
      await batAgentNFT.connect(buyer).approve(operator.address, 1);
      await expect(batAgentNFT.connect(operator).setAgentActive(1, false))
        .to.emit(batAgentNFT, "AgentStatusUpdated")
        .withArgs(1, false);
    });

    it("non-owner cannot set active status", async function () {
      await expect(batAgentNFT.connect(nonOwner).setAgentActive(1, false)).to.be.revertedWith(
        "BatAgentNFT: caller is not owner or approved"
      );
    });
  });

  describe("Usage Authorization", function () {
    beforeEach(async function () {
      await batAgentNFT
        .connect(creator)
        .mintAgent(buyer.address, name, category, metadataURI, metadataHash, encryptedDataHash);
    });

    it("owner can authorize usage", async function () {
      await expect(batAgentNFT.connect(buyer).authorizeUsage(1, executor.address, true))
        .to.emit(batAgentNFT, "UsageAuthorized")
        .withArgs(1, buyer.address, executor.address, true);

      expect(await batAgentNFT.isUsageAuthorized(1, executor.address)).to.be.true;
    });

    it("approved operator can authorize usage", async function () {
      await batAgentNFT.connect(buyer).approve(operator.address, 1);
      await expect(batAgentNFT.connect(operator).authorizeUsage(1, executor.address, true))
        .to.emit(batAgentNFT, "UsageAuthorized")
        .withArgs(1, buyer.address, executor.address, true);

      expect(await batAgentNFT.isUsageAuthorized(1, executor.address)).to.be.true;
    });

    it("non-owner cannot authorize usage", async function () {
      await expect(
        batAgentNFT.connect(nonOwner).authorizeUsage(1, executor.address, true)
      ).to.be.revertedWith("BatAgentNFT: caller is not owner or approved");
    });

    it("owner is implicitly authorized", async function () {
      expect(await batAgentNFT.isUsageAuthorized(1, buyer.address)).to.be.true;
      expect(await batAgentNFT.isUsageAuthorized(1, nonOwner.address)).to.be.false;
    });
  });

  describe("Transfer with Proof", function () {
    const sealedKey = ethers.hexlify(ethers.toUtf8Bytes("newSealedKey"));
    const proof = ethers.hexlify(ethers.toUtf8Bytes("reencryptionProof"));
    let proofHash;

    beforeEach(async function () {
      await batAgentNFT
        .connect(creator)
        .mintAgent(buyer.address, name, category, metadataURI, metadataHash, encryptedDataHash);

      proofHash = await mockOracle.hashTransferProof(
        buyer.address,
        nonOwner.address,
        1,
        sealedKey,
        proof
      );
    });

    it("transferWithProof succeeds when MockOracle approves the proof", async function () {
      // Owner registers the proof as valid in the oracle
      await mockOracle.connect(owner).approveProof(proofHash);

      await expect(
        batAgentNFT
          .connect(buyer)
          .transferWithProof(buyer.address, nonOwner.address, 1, sealedKey, proof)
      )
        .to.emit(batAgentNFT, "AgentTransferredWithProof")
        .withArgs(1, buyer.address, nonOwner.address, ethers.keccak256(sealedKey), ethers.keccak256(proof));

      expect(await batAgentNFT.ownerOf(1)).to.equal(nonOwner.address);
    });

    it("transferWithProof reverts when MockOracle does not approve the proof", async function () {
      await expect(
        batAgentNFT
          .connect(buyer)
          .transferWithProof(buyer.address, nonOwner.address, 1, sealedKey, proof)
      ).to.be.revertedWith("BatAgentNFT: transfer proof invalid");
    });

    it("transferWithProof rejects unauthorized caller", async function () {
      await mockOracle.connect(owner).approveProof(proofHash);

      await expect(
        batAgentNFT
          .connect(nonOwner)
          .transferWithProof(buyer.address, nonOwner.address, 1, sealedKey, proof)
      ).to.be.revertedWith("BatAgentNFT: caller is not owner or approved");
    });
  });

  describe("Existence Check", function () {
    it("exists returns true for minted token and false for missing token", async function () {
      expect(await batAgentNFT.exists(1)).to.be.false;

      await batAgentNFT
        .connect(creator)
        .mintAgent(buyer.address, name, category, metadataURI, metadataHash, encryptedDataHash);

      expect(await batAgentNFT.exists(1)).to.be.true;
    });
  });
});
