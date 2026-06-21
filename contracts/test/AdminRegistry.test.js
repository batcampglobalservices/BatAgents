const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AdminRegistry", function () {
  let AdminRegistry;
  let adminRegistry;
  let owner;
  let superadmin;
  let moderator;
  let normalUser;

  beforeEach(async function () {
    [owner, superadmin, moderator, normalUser] = await ethers.getSigners();
    AdminRegistry = await ethers.getContractFactory("AdminRegistry");
    adminRegistry = await AdminRegistry.deploy();
  });

  describe("Deployment", function () {
    it("deploys correctly and sets the right owner", async function () {
      expect(await adminRegistry.owner()).to.equal(owner.address);
    });

    it("owner is treated as superadmin", async function () {
      expect(await adminRegistry.isSuperAdmin(owner.address)).to.be.true;
      expect(await adminRegistry.canAccessAdmin(owner.address)).to.be.true;
    });
  });

  describe("SuperAdmin Management", function () {
    it("owner can add superadmin", async function () {
      await expect(adminRegistry.addSuperAdmin(superadmin.address))
        .to.emit(adminRegistry, "SuperAdminAdded")
        .withArgs(superadmin.address, owner.address);

      expect(await adminRegistry.isSuperAdmin(superadmin.address)).to.be.true;
      expect(await adminRegistry.canAccessAdmin(superadmin.address)).to.be.true;
    });

    it("non-owner cannot add superadmin", async function () {
      await expect(
        adminRegistry.connect(normalUser).addSuperAdmin(superadmin.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can remove superadmin", async function () {
      await adminRegistry.addSuperAdmin(superadmin.address);
      await expect(adminRegistry.removeSuperAdmin(superadmin.address))
        .to.emit(adminRegistry, "SuperAdminRemoved")
        .withArgs(superadmin.address, owner.address);

      expect(await adminRegistry.isSuperAdmin(superadmin.address)).to.be.false;
    });

    it("non-owner cannot remove superadmin", async function () {
      await adminRegistry.addSuperAdmin(superadmin.address);
      await expect(
        adminRegistry.connect(normalUser).removeSuperAdmin(superadmin.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("rejects zero address for superadmin add", async function () {
      await expect(
        adminRegistry.addSuperAdmin(ethers.ZeroAddress)
      ).to.be.revertedWith("AdminRegistry: zero address");
    });

    it("prevents removing owner access", async function () {
      await expect(
        adminRegistry.removeSuperAdmin(owner.address)
      ).to.be.revertedWith("AdminRegistry: cannot remove owner");
    });
  });

  describe("Moderator Management", function () {
    it("owner can add moderator", async function () {
      await expect(adminRegistry.addModerator(moderator.address))
        .to.emit(adminRegistry, "ModeratorAdded")
        .withArgs(moderator.address, owner.address);

      expect(await adminRegistry.isModerator(moderator.address)).to.be.true;
      expect(await adminRegistry.canAccessAdmin(moderator.address)).to.be.true;
    });

    it("non-owner cannot add moderator", async function () {
      await expect(
        adminRegistry.connect(normalUser).addModerator(moderator.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can remove moderator", async function () {
      await adminRegistry.addModerator(moderator.address);
      await expect(adminRegistry.removeModerator(moderator.address))
        .to.emit(adminRegistry, "ModeratorRemoved")
        .withArgs(moderator.address, owner.address);

      expect(await adminRegistry.isModerator(moderator.address)).to.be.false;
    });

    it("rejects zero address for moderator add", async function () {
      await expect(
        adminRegistry.addModerator(ethers.ZeroAddress)
      ).to.be.revertedWith("AdminRegistry: zero address");
    });
  });

  describe("Access Verification", function () {
    it("canAccessAdmin returns true for owner", async function () {
      expect(await adminRegistry.canAccessAdmin(owner.address)).to.be.true;
    });

    it("canAccessAdmin returns true for superadmin", async function () {
      await adminRegistry.addSuperAdmin(superadmin.address);
      expect(await adminRegistry.canAccessAdmin(superadmin.address)).to.be.true;
    });

    it("canAccessAdmin returns true for moderator", async function () {
      await adminRegistry.addModerator(moderator.address);
      expect(await adminRegistry.canAccessAdmin(moderator.address)).to.be.true;
    });

    it("canAccessAdmin returns false for normal wallet", async function () {
      expect(await adminRegistry.canAccessAdmin(normalUser.address)).to.be.false;
    });
  });
});
