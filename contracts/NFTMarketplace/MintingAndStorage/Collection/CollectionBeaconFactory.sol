// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "./Collection.sol";
import "./../../../Registry/IAdminRegistry.sol";

contract TestCollectionBeaconFactory {

    UpgradeableBeacon immutable beacon;
    address public adminRegistry;
    address public vLogic;
    
    mapping(uint256 => address) private collections;

    constructor(address _vLogic, address _adminRegistry) {
        beacon = new UpgradeableBeacon(_vLogic);
        vLogic = _vLogic;
        adminRegistry = _adminRegistry;
    }

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "Only Admin can call this!"
        );
        _;
    }

    function createCollectionProxy(string memory _name, string memory _symbol, string memory _baseURI, address _exchange, address _adminRegistry, uint256 x) external onlyAdmin returns (address) {
        BeaconProxy proxy = new BeaconProxy(address(beacon), 
            abi.encodeWithSelector(Collection(address(0)).initialize.selector, _name, _symbol, _baseURI, _exchange, _adminRegistry)
        );
        collections[x] = address(proxy);
        return address(proxy);
    }

    function updateImplementation(address _vLogic) public onlyAdmin {
        beacon.upgradeTo(_vLogic);
        vLogic = _vLogic;
    }

    function getImplementation() public view returns (address) {
        return beacon.implementation();
    }

     function getBeacon() public view returns (address) {
        return address(beacon);
    }

     function getCollectionProxy(uint256 x) public view returns (address) {
        return collections[x];
    }

    


}