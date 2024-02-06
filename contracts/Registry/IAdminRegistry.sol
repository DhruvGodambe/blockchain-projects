// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IAdminRegistry {

    function getRoleMember(bytes32 role, uint256 index) external view returns (address);

    function getRoleMemberCount(bytes32 role) external view returns (uint256);

    function getAdminRoleMembers()
        external
        view
        returns (uint256, address[] memory);
    
    function getTreasuryRoleMembers()
        external
        view
        returns (uint256, address[] memory);

    function isAdmin(address account) external view returns (bool);
    
    function isTreasury(address account) external view returns (bool);

    function addAdmin(address account) external;

    function leaveRole() external;

    function removeAdmin(address account) external;

}
