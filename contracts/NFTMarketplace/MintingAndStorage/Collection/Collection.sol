// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "./VersionAware.sol";
import "./../../../Registry/IAdminRegistry.sol";

contract Collection is Initializable, ERC721Upgradeable, VersionAware {

    address public adminRegistry;
    address public exchangeAddress;
    address public collectionFactory;
    string public baseURI;

    mapping(uint256 => string) public tokenIdToNftId;

    function initialize(string memory _name, string memory _symbol, string memory _baseURI, address _exchange, address _adminRegistry) public initializer {
        console.log("This is an NFT contract. Whoa!");
        __ERC721_init(_name, _symbol);
        collectionFactory = msg.sender;
        exchangeAddress = _exchange;
        adminRegistry = _adminRegistry;
        baseURI = _baseURI;
        versionAwareContractName = "Collection for NFTs: V1";
    }

    function getContractNameWithVersion() public pure override returns (string memory){
        return "Collection for NFTs: V1";
    }

    modifier onlyExchange() {
        console.log("msg.sender is : ", msg.sender);
        console.log("exchangeAddress is : ", exchangeAddress);
        require(msg.sender == exchangeAddress, 
        "Only Exchange can call this!");
        _;
    }

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "Only Admin can call this!"
        );
        _;
    }

    event BaseURIChanged(string baseURI);
    event NFTMintedinCollection(address signer);

    function _setbaseURI(string memory _baseURI) internal onlyAdmin returns (string memory) {
        baseURI = _baseURI;

        emit BaseURIChanged(baseURI);
        
        return baseURI;
    }


    function tokenURI(uint256 _tokenId)
        public
        view virtual override
        returns (string memory)
    {       string memory _nftId = tokenIdToNftId[_tokenId];
            return string(abi.encodePacked(baseURI, _nftId));
    }


    function mintCollectible(uint256 _tokenId, string memory _nftId) public onlyExchange returns (bool, uint256, string memory) {

        tokenIdToNftId[_tokenId] =_nftId;

        _mint(exchangeAddress, _tokenId);

        return (true, _tokenId ,string(abi.encodePacked(baseURI, _nftId)));
        
    }


}
