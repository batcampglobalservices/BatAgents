const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentFactory", function () {
  let mockOracle;
  let batAgentNFT;
  let agentFactory;
  let owner;
  let creator;
  let buyer;
  let nonOwner;

  const name = "Trading Bot";
  const category = "Finance";
  const metadataURI = "ipfs://QmDummyMetadata";
  const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("metadata"));
  const encryptedDataHash = ethers.keccak256(ethers.toUtf8Bytes("encryptedData"));

  beforeEach(async function () {
    [owner, creator, buyer, nonOwner] = await ethers.getSigners();

    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy();

    const BatAgentNFT = await ethers.getContractFactory("BatAgentNFT");
    batAgentNFT = await BatAgentNFT.deploy(await mockOracle.getAddress());

    const AgentFactory = await ethers.getContractFactory("AgentFactory");
    agentFactory = await AgentFactory.deploy(await batAgentNFT.getAddress());
  });

  describe("Deployment", function () {
    it("deploys correctly with valid agentNFT and zero initial mint fee", async function () {
      expect(await agentFactory.agentNFT()).to.equal(await batAgentNFT.getAddress());
      expect(await agentFactory.mintFee()).to.equal(0);
    });

    it("rejects zero agentNFT address in constructor", async function () {
      const AgentFactory = await ethers.getContractFactory("AgentFactory");
      await expect(AgentFactory.deploy(ethers.ZeroAddress)).to.be.revertedWith(
        "AgentFactory: zero agentNFT address"
      );
    });
  });

  describe("Mint Fee Configuration", function () {
    it("owner can set mint fee", async function () {
      const newFee = ethers.parseEther("0.05");
      await expect(agentFactory.connect(owner).setMintFee(newFee))
        .to.emit(agentFactory, "MintFeeUpdated")
        .withArgs(0, newFee);
      expect(await agentFactory.mintFee()).to.equal(newFee);
    });

    it("non-owner cannot set mint fee", async function () {
      const newFee = ethers.parseEther("0.05");
      await expect(
        agentFactory.connect(nonOwner).setMintFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Agent Creation", function () {
    beforeEach(async function () {
      // Must set the factory address on BatAgentNFT to allow minting
      await batAgentNFT.connect(owner).setFactory(await agentFactory.getAddress());
    });

    it("fails if factory is not set on BatAgentNFT", async function () {
      // Temporarily set factory to a dummy address to make agentFactory unauthorized
      await batAgentNFT.connect(owner).setFactory(nonOwner.address);

      await expect(
        agentFactory
          .connect(creator)
          .createAgent(name, category, metadataURI, metadataHash, encryptedDataHash)
      ).to.be.revertedWith("BatAgentNFT: caller is not minter");
    });

    it("mints an agent successfully with zero fee", async function () {
      await expect(
        agentFactory
          .connect(creator)
          .createAgent(name, category, metadataURI, metadataHash, encryptedDataHash)
      )
        .to.emit(agentFactory, "AgentCreated")
        .withArgs(1, creator.address, name, category)
        .and.to.emit(batAgentNFT, "AgentMinted")
        .withArgs(1, creator.address, name, category, metadataURI, metadataHash, encryptedDataHash);

      expect(await batAgentNFT.ownerOf(1)).to.equal(creator.address);
      const agent = await batAgentNFT.getAgent(1);
      expect(agent.creator).to.equal(creator.address);
    });

    it("mints an agent successfully when paying correct fee", async function () {
      const fee = ethers.parseEther("0.1");
      await agentFactory.connect(owner).setMintFee(fee);

      await expect(
        agentFactory
          .connect(creator)
          .createAgent(name, category, metadataURI, metadataHash, encryptedDataHash, { value: fee })
      )
        .to.emit(agentFactory, "AgentCreated")
        .withArgs(1, creator.address, name, category);

      expect(await ethers.provider.getBalance(await agentFactory.getAddress())).to.equal(fee);
    });

    it("refunds excess value if buyer overpays", async function () {
      const fee = ethers.parseEther("0.1");
      await agentFactory.connect(owner).setMintFee(fee);

      const overpayment = ethers.parseEther("0.15");
      const initialBalance = await ethers.provider.getBalance(creator.address);

      const tx = await agentFactory
        .connect(creator)
        .createAgent(name, category, metadataURI, metadataHash, encryptedDataHash, {
          value: overpayment,
        });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(creator.address);
      // Expected balance = initialBalance - fee - gasUsed
      expect(finalBalance).to.equal(initialBalance - fee - gasUsed);
    });

    it("reverts if payment is less than mint fee", async function () {
      const fee = ethers.parseEther("0.1");
      await agentFactory.connect(owner).setMintFee(fee);

      await expect(
        agentFactory
          .connect(creator)
          .createAgent(name, category, metadataURI, metadataHash, encryptedDataHash, {
            value: ethers.parseEther("0.05"),
          })
      ).to.be.revertedWith("AgentFactory: insufficient fee");
    });

    it("rejects empty or overlong names", async function () {
      await expect(
        agentFactory
          .connect(creator)
          .createAgent("", category, metadataURI, metadataHash, encryptedDataHash)
      ).to.be.revertedWith("AgentFactory: invalid name length");

      const longName = "a".repeat(65);
      await expect(
        agentFactory
          .connect(creator)
          .createAgent(longName, category, metadataURI, metadataHash, encryptedDataHash)
      ).to.be.revertedWith("AgentFactory: invalid name length");
    });

    it("rejects empty or overlong categories", async function () {
      await expect(
        agentFactory
          .connect(creator)
          .createAgent(name, "", metadataURI, metadataHash, encryptedDataHash)
      ).to.be.revertedWith("AgentFactory: invalid category length");

      const longCategory = "a".repeat(65);
      await expect(
        agentFactory
          .connect(creator)
          .createAgent(name, longCategory, metadataURI, metadataHash, encryptedDataHash)
      ).to.be.revertedWith("AgentFactory: invalid category length");
    });
  });

  describe("Fee Withdrawal", function () {
    beforeEach(async function () {
      await batAgentNFT.connect(owner).setFactory(await agentFactory.getAddress());
      const fee = ethers.parseEther("1.0");
      await agentFactory.connect(owner).setMintFee(fee);
      await agentFactory
        .connect(creator)
        .createAgent(name, category, metadataURI, metadataHash, encryptedDataHash, { value: fee });
    });

    it("owner can withdraw accumulated fees", async function () {
      const factoryBalanceBefore = await ethers.provider.getBalance(await agentFactory.getAddress());
      expect(factoryBalanceBefore).to.equal(ethers.parseEther("1.0"));

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await agentFactory.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const factoryBalanceAfter = await ethers.provider.getBalance(await agentFactory.getAddress());
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(factoryBalanceAfter).to.equal(0);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + factoryBalanceBefore - gasUsed);
    });

    it("non-owner cannot withdraw fees", async function () {
      await expect(
        agentFactory.connect(nonOwner).withdrawFees()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("reverts if withdrawing with zero balance", async function () {
      await agentFactory.connect(owner).withdrawFees();
      await expect(agentFactory.connect(owner).withdrawFees()).to.be.revertedWith(
        "AgentFactory: no fees to withdraw"
      );
    });
  });
});
