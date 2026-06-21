// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BatAgentNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AgentFactory is Ownable, ReentrancyGuard {
    BatAgentNFT public immutable agentNFT;
    uint256 public mintFee;

    event AgentCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string category
    );
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor(address _agentNFT) Ownable() {
        require(_agentNFT != address(0), "AgentFactory: zero agentNFT address");
        agentNFT = BatAgentNFT(_agentNFT);
    }

    function setMintFee(uint256 _mintFee) external onlyOwner {
        uint256 oldFee = mintFee;
        mintFee = _mintFee;
        emit MintFeeUpdated(oldFee, _mintFee);
    }

    function createAgent(
        string calldata name,
        string calldata category,
        string calldata metadataURI,
        bytes32 metadataHash,
        bytes32 encryptedDataHash
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintFee, "AgentFactory: insufficient fee");
        require(bytes(name).length > 0 && bytes(name).length <= 64, "AgentFactory: invalid name length");
        require(bytes(category).length > 0 && bytes(category).length <= 64, "AgentFactory: invalid category length");

        uint256 tokenId = agentNFT.mintAgentWithCreator(
            msg.sender,
            msg.sender,
            name,
            category,
            metadataURI,
            metadataHash,
            encryptedDataHash
        );

        emit AgentCreated(tokenId, msg.sender, name, category);

        // Refund excess fee if any
        if (msg.value > mintFee) {
            (bool success, ) = msg.sender.call{value: msg.value - mintFee}("");
            require(success, "AgentFactory: refund failed");
        }

        return tokenId;
    }

    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "AgentFactory: no fees to withdraw");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "AgentFactory: withdraw failed");

        emit FeesWithdrawn(owner(), balance);
    }
}
