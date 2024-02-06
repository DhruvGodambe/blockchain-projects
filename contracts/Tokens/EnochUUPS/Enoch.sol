// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract EnochUUPS is 
    Initializable, 
    UUPSUpgradeable, 
    ERC20Upgradeable, 
    ERC20BurnableUpgradeable, 
    PausableUpgradeable 
{
    address public _owner;

    modifier onlyAdmin() {
        require(
            msg.sender == _owner,
            "Only Admin can call this!"
        );
        _;
    }

    function initialize(uint256 _initialSupply) external initializer {
        __ERC20_init("ENOCH", "ENOCH");
        __ERC20Burnable_init();
        __Pausable_init();
        _owner = msg.sender;
        _mint(_owner, _initialSupply);
    }

    function _authorizeUpgrade(address newImplementation) internal onlyAdmin override {}

    function pause() public onlyAdmin whenNotPaused {
        _pause();
    }

    function unpause() public onlyAdmin whenPaused {
        _unpause();
    }

}