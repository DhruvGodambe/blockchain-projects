// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Registry/IAdminRegistry.sol";
import "./Airdrop.sol";

contract AirdropFactory {
    address public adminRegistry;

    //nftAddress => new airdrop address
    mapping(address => address[]) public nftToAirdrop;

    event NewAirdrop(
        address _nftAddress,
        string _name,
        address _airdrop,
        uint256 _timestamp
    );

    constructor(address _adminRegistry) {
        adminRegistry = _adminRegistry;
    }

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "Only Admin can call this!"
        );
        _;
    }

    function newAirdrop(address _nftAddress, string memory _name)
        public
        onlyAdmin
        returns (address _airdrop)
    {
        address airdrop = address(new Airdrop(_nftAddress, _name));

        nftToAirdrop[_nftAddress].push(airdrop);

        emit NewAirdrop(_nftAddress, _name, airdrop, block.timestamp);

        return airdrop;
    }
}
