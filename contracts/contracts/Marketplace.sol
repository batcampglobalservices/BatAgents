// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BatAgentNFT.sol";
import "./Royalties.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    BatAgentNFT public immutable agentNFT;
    Royalties public immutable royalties;
    address public oracle;

    uint256 public monthlyCreatorFeeWei;
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;
    uint256 public constant MIN_HIRE_DURATION = 30 minutes;
    uint256 public constant MAX_HIRE_DURATION = 30 days;

    struct Listing {
        address seller;
        uint256 price; // Buyout price
        uint256 hourlyRateWei; // Hire rate per hour
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => uint256) public agentSubscriptionExpiresAt;
    mapping(uint256 => mapping(address => uint256)) public hiredUntil;

    event AgentListed(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 hourlyRateWei);
    event AgentDelisted(uint256 indexed tokenId);
    event AgentSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event AgentHired(uint256 indexed tokenId, address indexed buyer, uint256 durationSeconds, uint256 totalCost);
    event SubscriptionPaid(uint256 indexed tokenId, address indexed creator, uint256 expiresAt);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);

    constructor(address _agentNFT, address _royalties, address _oracle) Ownable() {
        require(_agentNFT != address(0), "Marketplace: zero agentNFT");
        require(_royalties != address(0), "Marketplace: zero royalties");
        agentNFT = BatAgentNFT(_agentNFT);
        royalties = Royalties(_royalties);
        oracle = _oracle;
    }

    function setOracle(address _oracle) external onlyOwner {
        address oldOracle = oracle;
        oracle = _oracle;
        emit OracleUpdated(oldOracle, _oracle);
    }

    function setMonthlyCreatorFeeWei(uint256 newFeeWei) external onlyOwner {
        monthlyCreatorFeeWei = newFeeWei;
    }

    function payInitialAgentSubscription(uint256 tokenId) external payable {
        require(agentNFT.ownerOf(tokenId) == msg.sender, "Marketplace: not owner");
        require(agentSubscriptionExpiresAt[tokenId] == 0, "Marketplace: initial subscription already paid");
        require(msg.value == monthlyCreatorFeeWei, "Marketplace: incorrect fee");

        agentSubscriptionExpiresAt[tokenId] = block.timestamp + SUBSCRIPTION_DURATION;

        if (msg.value > 0) {
            royalties.recordRoyalty{value: msg.value}(royalties.owner());
        }

        emit SubscriptionPaid(tokenId, msg.sender, agentSubscriptionExpiresAt[tokenId]);
    }

    function renewAgentSubscription(uint256 tokenId) external payable {
        require(agentNFT.ownerOf(tokenId) == msg.sender, "Marketplace: not owner");
        require(msg.value == monthlyCreatorFeeWei, "Marketplace: incorrect fee");
        require(agentSubscriptionExpiresAt[tokenId] > 0, "Marketplace: initial subscription not paid");

        uint256 currentExpiry = agentSubscriptionExpiresAt[tokenId];
        uint256 baseTimestamp = (currentExpiry > block.timestamp) ? currentExpiry : block.timestamp;
        agentSubscriptionExpiresAt[tokenId] = baseTimestamp + SUBSCRIPTION_DURATION;

        if (msg.value > 0) {
            royalties.recordRoyalty{value: msg.value}(royalties.owner());
        }

        emit SubscriptionPaid(tokenId, msg.sender, agentSubscriptionExpiresAt[tokenId]);
    }

    function isAgentSubscriptionActive(uint256 tokenId) public view returns (bool) {
        return agentSubscriptionExpiresAt[tokenId] > block.timestamp;
    }

    function subscriptionExpiresAt(uint256 tokenId) external view returns (uint256) {
        return agentSubscriptionExpiresAt[tokenId];
    }

    function listAgentForBuyout(uint256 tokenId, uint256 price) external {
        _listAgentInternal(tokenId, price, 0);
    }

    function listAgent(uint256 tokenId, uint256 hourlyRateWei) external payable {
        if (!isAgentSubscriptionActive(tokenId)) {
            require(msg.value == monthlyCreatorFeeWei, "Marketplace: incorrect initial subscription fee");
            
            uint256 currentExpiry = agentSubscriptionExpiresAt[tokenId];
            uint256 baseTimestamp = (currentExpiry > block.timestamp) ? currentExpiry : block.timestamp;
            agentSubscriptionExpiresAt[tokenId] = baseTimestamp + SUBSCRIPTION_DURATION;
            
            if (msg.value > 0) {
                royalties.recordRoyalty{value: msg.value}(royalties.owner());
            }
            emit SubscriptionPaid(tokenId, msg.sender, agentSubscriptionExpiresAt[tokenId]);
        } else {
            require(msg.value == 0, "Marketplace: subscription already active, payment not required");
        }

        _listAgentInternal(tokenId, 0, hourlyRateWei);
    }

    function _listAgentInternal(uint256 tokenId, uint256 price, uint256 hourlyRateWei) internal {
        require(agentNFT.ownerOf(tokenId) == msg.sender, "Marketplace: not owner");
        require(price > 0 || hourlyRateWei > 0, "Marketplace: price must be greater than zero");
        require(
            agentNFT.getApproved(tokenId) == address(this) || 
            agentNFT.isApprovedForAll(msg.sender, address(this)),
            "Marketplace: contract not approved"
        );

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            hourlyRateWei: hourlyRateWei,
            active: true
        });

        emit AgentListed(tokenId, msg.sender, price, hourlyRateWei);
    }

    function delist(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Marketplace: listing not active");
        require(listing.seller == msg.sender, "Marketplace: not seller");

        listing.active = false;
        emit AgentDelisted(tokenId);
    }

    function purchase(
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Marketplace: listing not active");
        require(listing.price > 0, "Marketplace: not listed for buyout");
        require(msg.value == listing.price, "Marketplace: incorrect payment");

        listings[tokenId].active = false;

        royalties.recordRoyalty{value: msg.value}(listing.seller);

        agentNFT.transferWithProof(listing.seller, msg.sender, tokenId, sealedKey, proof);

        emit AgentSold(tokenId, listing.seller, msg.sender, msg.value);
    }

    function hireAgent(uint256 tokenId, uint256 durationSeconds) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.active, "Marketplace: listing not active");
        require(listing.hourlyRateWei > 0, "Marketplace: not listed for hire");
        require(isAgentSubscriptionActive(tokenId), "Marketplace: agent subscription expired");
        require(durationSeconds >= MIN_HIRE_DURATION, "Marketplace: duration below minimum");
        require(durationSeconds <= MAX_HIRE_DURATION, "Marketplace: duration exceeds maximum");

        uint256 expectedPayment = (listing.hourlyRateWei * durationSeconds) / 3600;
        require(msg.value == expectedPayment, "Marketplace: incorrect payment");

        address creator = agentNFT.getAgent(tokenId).creator;
        royalties.recordRoyalty{value: msg.value}(creator);

        uint256 currentExpiry = hiredUntil[tokenId][msg.sender];
        uint256 baseTimestamp = (currentExpiry > block.timestamp) ? currentExpiry : block.timestamp;
        hiredUntil[tokenId][msg.sender] = baseTimestamp + durationSeconds;

        agentNFT.authorizeUsage(tokenId, msg.sender, true);

        emit AgentHired(tokenId, msg.sender, durationSeconds, msg.value);
    }

    function hasAccess(address buyer, uint256 tokenId) external view returns (bool) {
        if (agentNFT.ownerOf(tokenId) == buyer) {
            return true;
        }
        return hiredUntil[tokenId][buyer] > block.timestamp;
    }
}
