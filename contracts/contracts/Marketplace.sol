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

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    event AgentListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event AgentDelisted(uint256 indexed tokenId);
    event AgentSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
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

    function listAgent(uint256 tokenId, uint256 price) external {
        require(agentNFT.ownerOf(tokenId) == msg.sender, "Marketplace: not owner");
        require(price > 0, "Marketplace: price must be greater than zero");
        require(
            agentNFT.getApproved(tokenId) == address(this) || 
            agentNFT.isApprovedForAll(msg.sender, address(this)),
            "Marketplace: contract not approved"
        );

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit AgentListed(tokenId, msg.sender, price);
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
        require(msg.value == listing.price, "Marketplace: incorrect payment");

        // Deactivate listing before transfer to prevent reentrancy / replay
        listings[tokenId].active = false;

        // Split payment and record royalty
        royalties.recordRoyalty{value: msg.value}(listing.seller);

        // Perform ownership transfer with proof verification
        agentNFT.transferWithProof(listing.seller, msg.sender, tokenId, sealedKey, proof);

        emit AgentSold(tokenId, listing.seller, msg.sender, msg.value);
    }
}
