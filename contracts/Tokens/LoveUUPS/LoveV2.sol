// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

contract LoveV2 is 
    Initializable, 
    UUPSUpgradeable, 
    ERC20Upgradeable, 
    ERC20BurnableUpgradeable
{
    address public _owner;
    string public ID;

    modifier onlyAdmin() {
        require(
            msg.sender == _owner,
            "Only Admin can call this!"
        );
        _;
    }

    function initialize(string memory _id) external reinitializer(2) {
        ID = _id;
    }

    function setID(string memory _newID) public onlyAdmin {
        ID = _newID;
    }

    function _authorizeUpgrade(address _newImplementation) internal onlyAdmin override {}
}