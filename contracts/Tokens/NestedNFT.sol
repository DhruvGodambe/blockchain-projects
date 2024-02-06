// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IERC20.sol";
import "../Registry/IAdminRegistry.sol";

contract NestedNFT is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string public baseURI = "";
    address internal enoch;
    address public adminRegistry;

    constructor(string memory _name, string memory _symbol, address _enochToken, address _adminRegistry) 
        ERC721(_name, _symbol)
    {
        enoch = _enochToken;
        adminRegistry = _adminRegistry;
    }

    // mapping to keep track of NestedTokensQuantity
    // nft Id => number of Enoch
    mapping(uint256 => uint256) nftValue;

    event VoucherRedeemed(address _user, uint256 _value);

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "AdminRegistry: Restricted to admin."
        );
        _;
    }

    // basically a NFT credit voucher like thing is minted which ultimately approves 
    // user for certain number of ERC-20 tokens to spend.
    // He can then redeem this voucher and get those tokens into his wallet and spend
    // them for his use.
    function mint(address _owner, uint256 _amount) public onlyAdmin returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
    
        string memory tokenURI = string(
            abi.encodePacked(baseURI, Strings.toString(newItemId))
        );
        _mint(_owner, newItemId);
        _setTokenURI(newItemId, tokenURI);
        nftValue[newItemId] = _amount;
        // IERC20(enoch).approve(_owner, _amount);
        IERC20(enoch).increaseAllowance(_owner, _amount);

        return newItemId;
    }

    function redeem(uint256 _tokenId) public {
        require(msg.sender == ownerOf(_tokenId), "Sender doesn't owns the voucher");
        require(balanceOf(address(this)) >= nftValue[_tokenId], "Contract doesn't have sufficient funds");
        IERC20(enoch).transferFrom(address(this), msg.sender, nftValue[_tokenId]);
        // burn the nft
        burn(_tokenId);

        emit VoucherRedeemed(msg.sender, nftValue[_tokenId]);
    }

    function burn(uint256 _tokenId) public {
        _burn(_tokenId);
    }

    function setBaseURI(string memory _uri) public onlyAdmin {
        baseURI = _uri;
    }

    function getValueOf(uint256 _tokenId) public view returns (uint256) {
        return nftValue[_tokenId];
    }
}
