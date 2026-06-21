// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Royalties is Ownable, ReentrancyGuard {
    uint256 public platformFeeBps;
    uint256 public constant MAX_PLATFORM_FEE_BPS = 2000; // 20% cap

    mapping(address => uint256) private _pendingBalances;

    event PlatformFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event RoyaltyRecorded(address indexed creator, uint256 grossAmount, uint256 creatorAmount, uint256 platformAmount);
    event Withdrawal(address indexed account, uint256 amount);

    constructor(uint256 _platformFeeBps) Ownable() {
        require(_platformFeeBps <= MAX_PLATFORM_FEE_BPS, "Royalties: fee exceeds cap");
        platformFeeBps = _platformFeeBps;
        emit PlatformFeeUpdated(0, _platformFeeBps);
    }

    function setPlatformFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_PLATFORM_FEE_BPS, "Royalties: fee exceeds cap");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(oldFee, newFeeBps);
    }

    function recordRoyalty(address creator) external payable {
        require(creator != address(0), "Royalties: creator is zero address");
        require(msg.value > 0, "Royalties: amount must be greater than zero");

        (uint256 creatorAmount, uint256 platformAmount) = calculateSplit(msg.value);

        _pendingBalances[creator] += creatorAmount;
        _pendingBalances[owner()] += platformAmount;

        emit RoyaltyRecorded(creator, msg.value, creatorAmount, platformAmount);
    }

    function withdraw() external nonReentrant {
        uint256 amount = _pendingBalances[msg.sender];
        require(amount > 0, "Royalties: no balance to withdraw");

        _pendingBalances[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Royalties: transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    function pendingBalanceOf(address account) external view returns (uint256) {
        return _pendingBalances[account];
    }

    function calculateSplit(uint256 amount) public view returns (uint256 creatorAmount, uint256 platformAmount) {
        platformAmount = (amount * platformFeeBps) / 10000;
        creatorAmount = amount - platformAmount;
    }
}
