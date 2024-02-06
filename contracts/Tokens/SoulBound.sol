// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SoulBound is ERC721URIStorage {

    address owner;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Knight Templer Distillery", "KTD") {
        owner = msg.sender;
    }

    mapping(address => string) public personToBarrel;
    mapping(address => bool) public rewardedBarrel;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function claimBarrel(string memory tokenURI)
        public
        returns (uint256)
    {
        require(rewardedBarrel[msg.sender], "Barrel is not rewarded");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        personToBarrel[msg.sender] = tokenURI;
        rewardedBarrel[msg.sender] = false;

        return newItemId;
    }

    function checkBarrelOfPerson(address person) external view returns (string memory) {
        return personToBarrel[person];
    }

    function rewardBarrel(address to) onlyOwner external {
        rewardedBarrel[to] = true;
    }
}