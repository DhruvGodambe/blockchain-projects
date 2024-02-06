// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "./GiftCard.sol";
import "./../Registry/IAdminRegistry.sol";

contract GiftCardFactory {

    UpgradeableBeacon immutable beacon;
    address public adminRegistry;
    address public giftCard;
    
    mapping(string => address) private giftCards;

    constructor(address _giftCard, address _adminRegistry) {
        beacon = new UpgradeableBeacon(_giftCard);
        giftCard = _giftCard;
        adminRegistry = _adminRegistry;
    }

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "Only Admin can call this!"
        );
        _;
    }

    function createGiftCardProxy(string memory _index) external onlyAdmin returns (address) {
        BeaconProxy proxy = new BeaconProxy(address(beacon), 
            abi.encodeWithSelector(GiftCard(address(0)).initialize.selector, adminRegistry)
        );
        giftCards[_index] = address(proxy);
        return address(proxy);
    }

    function updateImplementation(address _giftCard) public onlyAdmin {
        beacon.upgradeTo(_giftCard);
        giftCard = _giftCard;
    }

    function getImplementation() public view returns (address) {
        return beacon.implementation();
    }

     function getBeacon() public view returns (address) {
        return address(beacon);
    }

     function getGiftCardProxy(string memory _index) public view returns (address) {
        return giftCards[_index];
    }


}