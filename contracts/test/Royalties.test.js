const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Royalties", function () {
  let royalties;
  let owner;
  let creator;
  let buyer;
  let nonOwner;
  const initialPlatformFeeBps = 4000; // 40%

  beforeEach(async function () {
    [owner, creator, buyer, nonOwner] = await ethers.getSigners();

    const Royalties = await ethers.getContractFactory("Royalties");
    royalties = await Royalties.deploy(initialPlatformFeeBps);
  });

  describe("Deployment", function () {
    it("deploys with a valid platform fee", async function () {
      expect(await royalties.platformFeeBps()).to.equal(initialPlatformFeeBps);
      expect(await royalties.owner()).to.equal(owner.address);
    });

    it("rejects invalid platform fee above the cap", async function () {
      const Royalties = await ethers.getContractFactory("Royalties");
      await expect(Royalties.deploy(4001)).to.be.revertedWith("Royalties: fee exceeds cap");
    });
  });

  describe("Platform Fee Management", function () {
    it("owner can update platform fee", async function () {
      await expect(royalties.setPlatformFeeBps(3000))
        .to.emit(royalties, "PlatformFeeUpdated")
        .withArgs(initialPlatformFeeBps, 3000);
      expect(await royalties.platformFeeBps()).to.equal(3000);
    });

    it("rejects invalid platform fee above the cap when updating", async function () {
      await expect(royalties.setPlatformFeeBps(4001)).to.be.revertedWith("Royalties: fee exceeds cap");
    });

    it("non-owner cannot update platform fee", async function () {
      await expect(royalties.connect(nonOwner).setPlatformFeeBps(3000))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Recording Royalty", function () {
    it("rejects zero creator address", async function () {
      const amount = ethers.parseEther("1.0");
      await expect(
        royalties.connect(buyer).recordRoyalty(ethers.ZeroAddress, { value: amount })
      ).to.be.revertedWith("Royalties: creator is zero address");
    });

    it("records royalty split correctly and updates pending balances", async function () {
      const amount = ethers.parseEther("1.0"); // 1 ETH
      const [expectedCreator, expectedPlatform] = await royalties.calculateSplit(amount);

      // Perform transaction
      await expect(royalties.connect(buyer).recordRoyalty(creator.address, { value: amount }))
        .to.emit(royalties, "RoyaltyRecorded")
        .withArgs(creator.address, amount, expectedCreator, expectedPlatform);

      // Check balances
      expect(await royalties.pendingBalanceOf(creator.address)).to.equal(expectedCreator);
      expect(await royalties.pendingBalanceOf(owner.address)).to.equal(expectedPlatform);
      
      // Total pending balances match expected split
      const creatorBal = await royalties.pendingBalanceOf(creator.address);
      const ownerBal = await royalties.pendingBalanceOf(owner.address);
      expect(creatorBal + ownerBal).to.equal(amount);
    });
  });

  describe("Withdrawals", function () {
    it("creator can withdraw", async function () {
      const amount = ethers.parseEther("1.0");
      await royalties.connect(buyer).recordRoyalty(creator.address, { value: amount });

      const creatorPending = await royalties.pendingBalanceOf(creator.address);
      expect(creatorPending).to.be.gt(0);

      const initialBalance = await ethers.provider.getBalance(creator.address);

      // Creator withdraws
      const tx = await royalties.connect(creator).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * tx.gasPrice;

      const finalBalance = await ethers.provider.getBalance(creator.address);

      expect(finalBalance).to.equal(initialBalance + creatorPending - gasUsed);
      expect(await royalties.pendingBalanceOf(creator.address)).to.equal(0);
    });

    it("owner/platform can withdraw platform fees", async function () {
      const amount = ethers.parseEther("2.0");
      await royalties.connect(buyer).recordRoyalty(creator.address, { value: amount });

      const platformPending = await royalties.pendingBalanceOf(owner.address);
      expect(platformPending).to.be.gt(0);

      const initialBalance = await ethers.provider.getBalance(owner.address);

      const tx = await royalties.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * tx.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.equal(initialBalance + platformPending - gasUsed);
      expect(await royalties.pendingBalanceOf(owner.address)).to.equal(0);
    });

    it("prevents withdrawing with zero balance", async function () {
      await expect(royalties.connect(nonOwner).withdraw()).to.be.revertedWith("Royalties: no balance to withdraw");
    });
  });
});
