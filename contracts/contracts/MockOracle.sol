// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockOracle
 * @notice Development and test utility simulating TEE/oracle proof verifications for ERC-7857 Agentic ID transfers.
 * @dev THIS IS A MOCK UTILITY FOR LOCAL testing and dev environments only. It does not perform actual ZKP/TEE attestation checks.
 */
contract MockOracle is Ownable {
    mapping(bytes32 => bool) private _approvedProofs;

    event ProofApproved(bytes32 indexed proofHash);
    event ProofRevoked(bytes32 indexed proofHash);
    event TransferProofVerified(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        bytes32 proofHash,
        bool valid
    );

    constructor() Ownable() {}

    function approveProof(bytes32 proofHash) external onlyOwner {
        require(proofHash != bytes32(0), "MockOracle: zero proof hash");
        _approvedProofs[proofHash] = true;
        emit ProofApproved(proofHash);
    }

    function revokeProof(bytes32 proofHash) external onlyOwner {
        _approvedProofs[proofHash] = false;
        emit ProofRevoked(proofHash);
    }

    function isProofApproved(bytes32 proofHash) external view returns (bool) {
        return _approvedProofs[proofHash];
    }

    function hashTransferProof(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(from, to, tokenId, sealedKey, proof));
    }

    function verifyTransferProof(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external returns (bool) {
        require(from != address(0), "MockOracle: zero from address");
        require(to != address(0), "MockOracle: zero to address");
        require(sealedKey.length > 0, "MockOracle: empty sealed key");
        require(proof.length > 0, "MockOracle: empty proof");

        bytes32 proofHash = hashTransferProof(from, to, tokenId, sealedKey, proof);
        bool valid = _approvedProofs[proofHash];

        emit TransferProofVerified(from, to, tokenId, proofHash, valid);
        return valid;
    }
}
