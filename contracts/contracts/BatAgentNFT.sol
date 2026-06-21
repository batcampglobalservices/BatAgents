// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface ITransferProofOracle {
    function verifyTransferProof(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external returns (bool);
}

contract BatAgentNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    struct AgentData {
        address creator;
        string name;
        string category;
        string metadataURI;
        bytes32 metadataHash;
        bytes32 encryptedDataHash;
        bool active;
        uint256 createdAt;
    }

    Counters.Counter private _tokenIds;

    mapping(uint256 => AgentData) private _agents;
    mapping(uint256 => mapping(address => bool)) private _authorizedExecutors;

    ITransferProofOracle public transferOracle;
    address public factory;

    event AgentMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string category,
        string metadataURI,
        bytes32 metadataHash,
        bytes32 encryptedDataHash
    );

    event AgentStatusUpdated(uint256 indexed tokenId, bool active);

    event TransferOracleUpdated(address indexed oldOracle, address indexed newOracle);
    event FactoryUpdated(address indexed oldFactory, address indexed newFactory);

    event AgentTransferredWithProof(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 sealedKeyHash,
        bytes32 proofHash
    );

    event UsageAuthorized(
        uint256 indexed tokenId,
        address indexed owner,
        address indexed executor,
        bool authorized
    );

    modifier onlyMinter() {
        require(msg.sender == owner() || msg.sender == factory, "BatAgentNFT: caller is not minter");
        _;
    }

    constructor(address _transferOracle) ERC721("Bat Agent NFT", "BATAGENT") Ownable() {
        require(_transferOracle != address(0), "BatAgentNFT: zero oracle address");
        transferOracle = ITransferProofOracle(_transferOracle);
        emit TransferOracleUpdated(address(0), _transferOracle);
    }

    function setFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "BatAgentNFT: zero factory address");
        address oldFactory = factory;
        factory = _factory;
        emit FactoryUpdated(oldFactory, _factory);
    }

    function mintAgentWithCreator(
        address to,
        address creator,
        string calldata name,
        string calldata category,
        string calldata metadataURI,
        bytes32 metadataHash,
        bytes32 encryptedDataHash
    ) external onlyMinter returns (uint256) {
        require(to != address(0), "BatAgentNFT: mint to zero address");
        require(creator != address(0), "BatAgentNFT: creator is zero address");
        require(bytes(name).length > 0, "BatAgentNFT: empty name");
        require(bytes(category).length > 0, "BatAgentNFT: empty category");
        require(bytes(metadataURI).length > 0, "BatAgentNFT: empty metadata URI");
        require(metadataHash != bytes32(0), "BatAgentNFT: zero metadata hash");
        require(encryptedDataHash != bytes32(0), "BatAgentNFT: zero encrypted data hash");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        _agents[newTokenId] = AgentData({
            creator: creator,
            name: name,
            category: category,
            metadataURI: metadataURI,
            metadataHash: metadataHash,
            encryptedDataHash: encryptedDataHash,
            active: true,
            createdAt: block.timestamp
        });

        emit AgentMinted(
            newTokenId,
            creator,
            name,
            category,
            metadataURI,
            metadataHash,
            encryptedDataHash
        );

        return newTokenId;
    }

    function mintAgent(
        address to,
        string calldata name,
        string calldata category,
        string calldata metadataURI,
        bytes32 metadataHash,
        bytes32 encryptedDataHash
    ) external returns (uint256) {
        require(to != address(0), "BatAgentNFT: mint to zero address");
        require(bytes(name).length > 0, "BatAgentNFT: empty name");
        require(bytes(category).length > 0, "BatAgentNFT: empty category");
        require(bytes(metadataURI).length > 0, "BatAgentNFT: empty metadata URI");
        require(metadataHash != bytes32(0), "BatAgentNFT: zero metadata hash");
        require(encryptedDataHash != bytes32(0), "BatAgentNFT: zero encrypted data hash");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        _agents[newTokenId] = AgentData({
            creator: msg.sender,
            name: name,
            category: category,
            metadataURI: metadataURI,
            metadataHash: metadataHash,
            encryptedDataHash: encryptedDataHash,
            active: true,
            createdAt: block.timestamp
        });

        emit AgentMinted(
            newTokenId,
            msg.sender,
            name,
            category,
            metadataURI,
            metadataHash,
            encryptedDataHash
        );

        return newTokenId;
    }

    function getAgent(uint256 tokenId) external view returns (AgentData memory) {
        require(_exists(tokenId), "BatAgentNFT: query for nonexistent token");
        return _agents[tokenId];
    }

    function setAgentActive(uint256 tokenId, bool active) external {
        require(_exists(tokenId), "BatAgentNFT: query for nonexistent token");
        require(_isApprovedOrOwner(msg.sender, tokenId), "BatAgentNFT: caller is not owner or approved");
        _agents[tokenId].active = active;
        emit AgentStatusUpdated(tokenId, active);
    }

    function setTransferOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "BatAgentNFT: zero oracle address");
        address oldOracle = address(transferOracle);
        transferOracle = ITransferProofOracle(newOracle);
        emit TransferOracleUpdated(oldOracle, newOracle);
    }

    function transferWithProof(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external nonReentrant {
        require(_exists(tokenId), "BatAgentNFT: query for nonexistent token");
        require(_isApprovedOrOwner(msg.sender, tokenId), "BatAgentNFT: caller is not owner or approved");
        
        bool success = transferOracle.verifyTransferProof(from, to, tokenId, sealedKey, proof);
        require(success, "BatAgentNFT: transfer proof invalid");

        _safeTransfer(from, to, tokenId, "");

        emit AgentTransferredWithProof(
            tokenId,
            from,
            to,
            keccak256(sealedKey),
            keccak256(proof)
        );
    }

    function authorizeUsage(uint256 tokenId, address executor, bool authorized) external {
        require(_exists(tokenId), "BatAgentNFT: query for nonexistent token");
        require(_isApprovedOrOwner(msg.sender, tokenId), "BatAgentNFT: caller is not owner or approved");
        _authorizedExecutors[tokenId][executor] = authorized;
        emit UsageAuthorized(tokenId, ownerOf(tokenId), executor, authorized);
    }

    function isUsageAuthorized(uint256 tokenId, address executor) external view returns (bool) {
        require(_exists(tokenId), "BatAgentNFT: query for nonexistent token");
        return _authorizedExecutors[tokenId][executor] || ownerOf(tokenId) == executor;
    }

    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }
}
