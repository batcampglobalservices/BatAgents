const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockOracle", function () {
  let mockOracle;
  let owner;
  let nonOwner;
  let fromAddr;
  let toAddr;
  const tokenId = 1;
  const sealedKey = ethers.hexlify(ethers.toUtf8Bytes("sealedKeyMaterial"));
  const proof = ethers.hexlify(ethers.toUtf8Bytes("proofData"));

  beforeEach(async function () {
    [owner, nonOwner, fromAddr, toAddr] = await ethers.getSigners();
    const MockOracle = await ethers.getContractFactory("MockOracle");
    mockOracle = await MockOracle.deploy();
  });

  describe("Deployment", function () {
    it("deploys correctly with owner set", async function () {
      expect(await mockOracle.owner()).to.equal(owner.address);
    });
  });

  describe("Proof Approval and Revocation", function () {
    const dummyHash = ethers.keccak256(ethers.toUtf8Bytes("dummyProof"));

    it("owner can approve proof hash", async function () {
      await expect(mockOracle.approveProof(dummyHash))
        .to.emit(mockOracle, "ProofApproved")
        .withArgs(dummyHash);
      expect(await mockOracle.isProofApproved(dummyHash)).to.be.true;
    });

    it("non-owner cannot approve proof hash", async function () {
      await expect(
        mockOracle.connect(nonOwner).approveProof(dummyHash)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("owner can revoke proof hash", async function () {
      await mockOracle.approveProof(dummyHash);
      expect(await mockOracle.isProofApproved(dummyHash)).to.be.true;

      await expect(mockOracle.revokeProof(dummyHash))
        .to.emit(mockOracle, "ProofRevoked")
        .withArgs(dummyHash);
      expect(await mockOracle.isProofApproved(dummyHash)).to.be.false;
    });

    it("rejects zero proof hash approval", async function () {
      await expect(
        mockOracle.approveProof(ethers.ZeroHash)
      ).to.be.revertedWith("MockOracle: zero proof hash");
    });
  });

  describe("Proof Hashing and Verification", function () {
    let expectedHash;

    beforeEach(async function () {
      expectedHash = await mockOracle.hashTransferProof(
        fromAddr.address,
        toAddr.address,
        tokenId,
        sealedKey,
        proof
      );
    });

    it("calculates deterministic proof hash", async function () {
      const localHash = ethers.solidityPackedKeccak256(
        ["address", "address", "uint256", "bytes", "bytes"],
        [fromAddr.address, toAddr.address, tokenId, sealedKey, proof]
      );
      expect(expectedHash).to.equal(localHash);
    });

    it("verifies approved transfer proof as true", async function () {
      await mockOracle.approveProof(expectedHash);

      await expect(
        mockOracle.verifyTransferProof(
          fromAddr.address,
          toAddr.address,
          tokenId,
          sealedKey,
          proof
        )
      )
        .to.emit(mockOracle, "TransferProofVerified")
        .withArgs(fromAddr.address, toAddr.address, tokenId, expectedHash, true);
    });

    it("verifies unapproved transfer proof as false", async function () {
      await expect(
        mockOracle.verifyTransferProof(
          fromAddr.address,
          toAddr.address,
          tokenId,
          sealedKey,
          proof
        )
      )
        .to.emit(mockOracle, "TransferProofVerified")
        .withArgs(fromAddr.address, toAddr.address, tokenId, expectedHash, false);
    });

    it("rejects zero from address", async function () {
      await expect(
        mockOracle.verifyTransferProof(
          ethers.ZeroAddress,
          toAddr.address,
          tokenId,
          sealedKey,
          proof
        )
      ).to.be.revertedWith("MockOracle: zero from address");
    });

    it("rejects zero to address", async function () {
      await expect(
        mockOracle.verifyTransferProof(
          fromAddr.address,
          ethers.ZeroAddress,
          tokenId,
          sealedKey,
          proof
        )
      ).to.be.revertedWith("MockOracle: zero to address");
    });

    it("rejects empty sealed key", async function () {
      await expect(
        mockOracle.verifyTransferProof(
          fromAddr.address,
          toAddr.address,
          tokenId,
          "0x",
          proof
        )
      ).to.be.revertedWith("MockOracle: empty sealed key");
    });

    it("rejects empty proof", async function () {
      await expect(
        mockOracle.verifyTransferProof(
          fromAddr.address,
          toAddr.address,
          tokenId,
          sealedKey,
          "0x"
        )
      ).to.be.revertedWith("MockOracle: empty proof");
    });
  });
});
