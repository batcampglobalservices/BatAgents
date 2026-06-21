// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AdminRegistry
 * @dev Manages superadmin and moderator roles for Bat Agents without centralized roles.
 */
contract AdminRegistry is Ownable {
    mapping(address => bool) private _superAdmins;
    mapping(address => bool) private _moderators;

    event SuperAdminAdded(address indexed account, address indexed addedBy);
    event SuperAdminRemoved(address indexed account, address indexed removedBy);
    event ModeratorAdded(address indexed account, address indexed addedBy);
    event ModeratorRemoved(address indexed account, address indexed removedBy);

    constructor() Ownable() {}

    /**
     * @dev Throws if called by any account other than the owner or a superadmin.
     */
    modifier onlySuperAdmin() {
        require(owner() == _msgSender() || _superAdmins[_msgSender()], "AdminRegistry: caller is not superadmin");
        _;
    }

    function addSuperAdmin(address account) external onlyOwner {
        require(account != address(0), "AdminRegistry: zero address");
        _superAdmins[account] = true;
        emit SuperAdminAdded(account, _msgSender());
    }

    function removeSuperAdmin(address account) external onlyOwner {
        require(account != owner(), "AdminRegistry: cannot remove owner");
        _superAdmins[account] = false;
        emit SuperAdminRemoved(account, _msgSender());
    }

    function isSuperAdmin(address account) public view returns (bool) {
        return account == owner() || _superAdmins[account];
    }

    function addModerator(address account) external onlyOwner {
        require(account != address(0), "AdminRegistry: zero address");
        _moderators[account] = true;
        emit ModeratorAdded(account, _msgSender());
    }

    function removeModerator(address account) external onlyOwner {
        _moderators[account] = false;
        emit ModeratorRemoved(account, _msgSender());
    }

    function isModerator(address account) public view returns (bool) {
        return _moderators[account];
    }

    function canAccessAdmin(address account) external view returns (bool) {
        return isSuperAdmin(account) || isModerator(account);
    }
}
