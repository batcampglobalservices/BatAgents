// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BatAgentNFT.sol";
import "./Royalties.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AgentAccessControl is Ownable, ReentrancyGuard {
    BatAgentNFT public immutable agentNFT;
    Royalties public immutable royalties;
    address public usageTracker;

    struct RentalTerms {
        uint256 pricePerDay;
    }

    struct MessageTerms {
        uint256 pricePerMessage;
    }

    mapping(uint256 => RentalTerms) public rentalTerms;
    mapping(uint256 => MessageTerms) public messageTerms;

    mapping(uint256 => mapping(address => uint256)) public rentedUntil;
    mapping(uint256 => mapping(address => uint256)) public messageCredits;

    event RentalTermsUpdated(uint256 indexed tokenId, uint256 pricePerDay);
    event MessageTermsUpdated(uint256 indexed tokenId, uint256 pricePerMessage);
    event RentalPurchased(uint256 indexed tokenId, address indexed buyer, uint256 rentedUntilTimestamp);
    event MessageCreditsPurchased(uint256 indexed tokenId, address indexed buyer, uint256 creditsCount);
    event MessageCreditConsumed(uint256 indexed tokenId, address indexed buyer, uint256 remainingCredits);
    event UsageTrackerUpdated(address indexed oldTracker, address indexed newTracker);

    modifier onlyOwnerOf(uint256 tokenId) {
        require(agentNFT.ownerOf(tokenId) == msg.sender, "AgentAccessControl: not owner");
        _;
    }

    modifier onlyUsageTracker() {
        require(msg.sender == usageTracker, "AgentAccessControl: not usage tracker");
        _;
    }

    constructor(address _agentNFT, address _royalties) Ownable() {
        require(_agentNFT != address(0), "AgentAccessControl: zero agentNFT");
        require(_royalties != address(0), "AgentAccessControl: zero royalties");
        agentNFT = BatAgentNFT(_agentNFT);
        royalties = Royalties(_royalties);
    }

    function setUsageTracker(address _usageTracker) external onlyOwner {
        require(_usageTracker != address(0), "AgentAccessControl: zero usage tracker address");
        address oldTracker = usageTracker;
        usageTracker = _usageTracker;
        emit UsageTrackerUpdated(oldTracker, _usageTracker);
    }

    function setRentalTerms(uint256 tokenId, uint256 pricePerDay) external onlyOwnerOf(tokenId) {
        rentalTerms[tokenId] = RentalTerms(pricePerDay);
        emit RentalTermsUpdated(tokenId, pricePerDay);
    }

    function setMessageTerms(uint256 tokenId, uint256 pricePerMessage) external onlyOwnerOf(tokenId) {
        messageTerms[tokenId] = MessageTerms(pricePerMessage);
        emit MessageTermsUpdated(tokenId, pricePerMessage);
    }

    function rent(uint256 tokenId, uint256 days_) external payable nonReentrant {
        RentalTerms memory terms = rentalTerms[tokenId];
        require(terms.pricePerDay > 0, "AgentAccessControl: rental not available");
        require(days_ > 0, "AgentAccessControl: invalid days");
        require(msg.value == terms.pricePerDay * days_, "AgentAccessControl: incorrect payment");

        // Record royalty for the NFT creator
        address creator = agentNFT.getAgent(tokenId).creator;
        royalties.recordRoyalty{value: msg.value}(creator);

        uint256 base = rentedUntil[tokenId][msg.sender] > block.timestamp 
            ? rentedUntil[tokenId][msg.sender] 
            : block.timestamp;
        uint256 until = base + (days_ * 1 days);
        rentedUntil[tokenId][msg.sender] = until;

        // Authorize usage on the NFT itself
        agentNFT.authorizeUsage(tokenId, msg.sender, true);

        emit RentalPurchased(tokenId, msg.sender, until);
    }

    function payPerMessage(uint256 tokenId, uint256 messageCount) external payable nonReentrant {
        MessageTerms memory terms = messageTerms[tokenId];
        require(terms.pricePerMessage > 0, "AgentAccessControl: PPM not available");
        require(messageCount > 0, "AgentAccessControl: invalid message count");
        require(msg.value == terms.pricePerMessage * messageCount, "AgentAccessControl: incorrect payment");

        // Record royalty for the NFT creator
        address creator = agentNFT.getAgent(tokenId).creator;
        royalties.recordRoyalty{value: msg.value}(creator);

        messageCredits[tokenId][msg.sender] += messageCount;

        // Authorize usage on the NFT itself
        agentNFT.authorizeUsage(tokenId, msg.sender, true);

        emit MessageCreditsPurchased(tokenId, msg.sender, messageCount);
    }

    function consumeMessageCredit(uint256 tokenId, address buyer) external onlyUsageTracker {
        require(messageCredits[tokenId][buyer] > 0, "AgentAccessControl: no credits");
        messageCredits[tokenId][buyer] -= 1;

        emit MessageCreditConsumed(tokenId, buyer, messageCredits[tokenId][buyer]);

        // If credits drop to 0, and they don't have active rental, we can revoke authorization
        if (messageCredits[tokenId][buyer] == 0 && rentedUntil[tokenId][buyer] <= block.timestamp) {
            agentNFT.authorizeUsage(tokenId, buyer, false);
        }
    }

    function hasAccess(address buyer, uint256 tokenId) external view returns (bool) {
        if (agentNFT.ownerOf(tokenId) == buyer) {
            return true;
        }
        if (rentedUntil[tokenId][buyer] > block.timestamp) {
            return true;
        }
        if (messageCredits[tokenId][buyer] > 0) {
            return true;
        }
        return false;
    }
}
