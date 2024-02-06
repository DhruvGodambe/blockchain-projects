// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IMintingFactory {
    function createNFTCollection(
        string memory _name, 
        string memory _symbol
        )
        external
        returns (address);

    function mintNFT(
        address _nftCollection,
        uint256 _tokenId,
        string memory _nftId
    ) external returns (bool, string memory);
    
    function updateOwner(
        address _nftCollection,
        address _newOwner,
        uint256 _tokenId
    ) external;
}
