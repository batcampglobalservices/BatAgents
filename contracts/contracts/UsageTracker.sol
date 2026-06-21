// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgentAccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UsageTracker is Ownable {
    AgentAccessControl public immutable accessControl;
    address public backendSigner;

    event UsageRecorded(uint256 indexed tokenId, address indexed user, uint256 timestamp, uint256 approxTokens);
    event BackendSignerUpdated(address indexed oldSigner, address indexed newSigner);

    modifier onlyBackendSigner() {
        require(msg.sender == backendSigner, "UsageTracker: caller is not backend signer");
        _;
    }

    constructor(address _accessControl, address _backendSigner) Ownable() {
        require(_accessControl != address(0), "UsageTracker: zero access control address");
        require(_backendSigner != address(0), "UsageTracker: zero backend signer address");
        accessControl = AgentAccessControl(_accessControl);
        backendSigner = _backendSigner;
    }

    function setBackendSigner(address _newSigner) external onlyOwner {
        require(_newSigner != address(0), "UsageTracker: zero backend signer address");
        address oldSigner = backendSigner;
        backendSigner = _newSigner;
        emit BackendSignerUpdated(oldSigner, _newSigner);
    }

    function recordUsage(uint256 tokenId, address user, uint256 approxTokens) external onlyBackendSigner {
        // Retrieve instances
        BatAgentNFT agentNFT = accessControl.agentNFT();
        
        // Owner and Active Renters do not consume message credits
        bool isOwner = (agentNFT.ownerOf(tokenId) == user);
        bool hasActiveRental = (accessControl.rentedUntil(tokenId, user) > block.timestamp);

        if (!isOwner && !hasActiveRental) {
            accessControl.consumeMessageCredit(tokenId, user);
        }

        emit UsageRecorded(tokenId, user, block.timestamp, approxTokens);
    }
}
