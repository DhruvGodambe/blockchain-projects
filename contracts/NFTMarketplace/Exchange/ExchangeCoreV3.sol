// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./../MintingAndStorage/Collection/Collection.sol";
import "../Interface/IERC20.sol";
import "../Interface/IMintingFactory.sol";
import "../../Registry/IAdminRegistry.sol";
import "../SignatureLib.sol";

contract ExchangeCoreV3 is 
    Initializable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    using SafeMath for uint256;

    IMintingFactory internal mintingFactory;

    address public treasury;
    address public adminRegistry;
    string public ID;
    string public IamV3;

    event FixedPricePrimarySale(
        address _nftCollection, 
        uint256 _tokenId,
        string _tokenURL,
        uint256 _nftPrice,  
        address _buyer, 
        address _buyerToken
    );

    event SignatureVerified(
        address signer
    );

    event AuctionPrimarySaleExecuted(
        address _nftCollection, 
        uint256 _tokenId,
        string _tokenURL,
        uint256 _nftPrice,  
        address _buyer, 
        address _buyerToken
    );

    event NFTMinted(address nftCollection, uint256 tokenId, address sender);

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "Only Admin can call this!"
        );
        _;
    }
    
    modifier validateSeller(
        address _nftCollection,
        uint256 _tokenId,
        address _seller
    ) {
        address tokenOwner = IERC721Upgradeable(_nftCollection).ownerOf(_tokenId);
        require(_seller == tokenOwner, "Seller does not owns the token");

        // check token approval
        address tokenApprovedAddress = IERC721Upgradeable(_nftCollection).getApproved(
            _tokenId
        );
        require(
            tokenApprovedAddress == address(this),
            "Contract is not approved for this NFT"
        );
        _;
    }

    modifier validateBuyer(
        address _buyer, 
        uint256 _amount, 
        address _buyerToken
    ) {
        require(
            IERC20(_buyerToken).allowance(_buyer, address(this)) > _amount,
            "Allowance is less than the NFT's price."
        );
        require(
            IERC20(_buyerToken).balanceOf(_buyer) > _amount,
            "Buyer doesn't have sufficient funds"
        );
        _;
    }


    function initialize() public onlyAdmin {
        IamV3 = "V3";
    }

    function setID(string memory _id) public onlyAdmin {
        ID = _id;
    }
    
    function setIamV3(string memory _iamV3) public onlyAdmin {
        IamV3 = _iamV3;
    }

    function fixedPricePrimarySale(
        address _nftCollection, 
        uint256 _nftPrice,
        uint256 _tokenId,
        string memory _nftId,
        address _buyer,
        address _buyerToken
    ) public onlyAdmin nonReentrant validateBuyer(_buyer, _nftPrice, _buyerToken) {

        require(IERC20(_buyerToken).allowance(_buyer, address(this)) >= _nftPrice, "Exchange is not allowed enough tokens");

        IERC20(_buyerToken).transferFrom(_buyer, treasury, _nftPrice);

        string memory _tokenURL  = mintAndTransfer(_nftCollection, _tokenId, _nftId);

        IMintingFactory(mintingFactory).updateOwner(_nftCollection, _buyer, _tokenId);

        emit FixedPricePrimarySale(_nftCollection, _tokenId, _tokenURL, _nftPrice,  _buyer, _buyerToken);

    }


    function mintAndTransfer(
        address _nftCollection,
        uint256 _tokenId,
        string memory _nftId
    ) internal returns (string memory) {
        
        (bool success, uint256 tokenId, string memory _tokenURL) = Collection(_nftCollection).mintCollectible(_tokenId, _nftId);
        
        if(success){
            IERC721Upgradeable(_nftCollection).transferFrom(address(mintingFactory), msg.sender, _tokenId);
        }

        emit NFTMinted(_nftCollection, tokenId, msg.sender);
        
        return _tokenURL;
    }


    function auctionPrimarySale(
        address _nftCollection,
        uint256 _nftPrice,
        uint256 _tokenId,
        string memory _nftId,
        address _buyer,
        address _buyerToken,
        string memory _message,
        bytes memory _signature
    ) public onlyAdmin nonReentrant whenNotPaused validateBuyer(_buyer, _nftPrice, _buyerToken) {

        bool validSignature = SignatureLib.verifySignature(_message, _signature, _buyer);
        require(validSignature, "Signature mismatched with buyer's");

        require(IERC20(_buyerToken).allowance(_buyer, address(this)) >= _nftPrice, "Exchange is not allowed enough tokens");

        IERC20(_buyerToken).transferFrom(_buyer, treasury, _nftPrice);
       
        string memory _tokenURL  = mintAndTransfer(_nftCollection, _tokenId, _nftId);

        IMintingFactory(mintingFactory).updateOwner(_nftCollection, _buyer, _tokenId);

        emit AuctionPrimarySaleExecuted(_nftCollection, _tokenId, _tokenURL, _nftPrice ,_buyer, _buyerToken);
    }


    // function auctionSecondarySale(
    //     address _nftCollection,
    //     uint256 _tokenId,
    //     uint256 _nftPrice,
    //     address _exchange,
    //     address _buyer,
    //     address _buyerToken

    // ) public onlyAdmin whenNotPaused {

    //     // Validating the signature of buyer
    //     // bool validSignature = VerifySignature(_hashedMessage, _v, _r, _s, _buyer);
    //     // require(validSignature, "Signature mismatched with buyer's");


    //     // Validating all the requirements
    //     // bool validTime;
    //     // if (_auctionEndTime != 0) {
    //     //     validTime = validateAuctionTime(_auctionEndTime);
    //     // } else {
    //     //     validTime = true;
    //     // }

    //     bool validSeller = validateSeller(_nftCollection, _tokenId, _exchange);
    //     bool validBuyer = validateBuyer(_buyer, _nftPrice, _buyerToken);

    //     // bool isCancel = cancelledOrders[_buyer][_nftCollection][_tokenId];

    //     // require(validTime, "Auction is already over");
    //     require(validSeller, "Seller isn't valid");
    //     require(validBuyer, "Buyer isn't valid");
    //     // require(isCancel == false, "Order is cancelled");

    //     _nftPrice *= 1e18;

    //     // transfer tradingFee to the exchange 4%
    //     //ERC20
    //     // uint256 fee = _nftPrice.mul(tradingFeeFactor).div(tradingFeeFactorMax);
    //     // IERC20(_buyerToken).transferFrom(_buyer, address(this), fee);


    //     // transferring the amount to the seller
    //     // uint256 transferableAmt = _nftPrice-fee;

    //     // uint256 transferableAmt = _nftPrice
    //     //     .mul(tradingFeeFactorMax.sub(tradingFeeFactor))
    //     //     .div(tradingFeeFactorMax);
    //     // IERC20(_buyerToken).transferFrom(_buyer, _exchange, transferableAmt);
    //     // IERC20(_buyerToken).transferFrom(_buyer, treasury, transferableAmt);

    //     // transferring the NFT to the buyer
    //     IERC721(_nftCollection).transferFrom(_exchange, _buyer, _tokenId);
    //     // updating the NFT ownership in our Minting Factory
    //     // IMintingFactory(mintingFactory).updateOwner(
    //     //     _nftCollection,
    //     //     _tokenId,
    //     //     _buyer
    //     // );

    //     // emit AuctionSecondarySaleExecuted(_nftCollection, _nftPrice, _tokenId, _buyer, _buyerToken);
    // }


    function _authorizeUpgrade(address _newImplementation) internal onlyAdmin override {}

    
    function pause() public virtual onlyAdmin whenNotPaused{
        _pause();
    }

    function unPause() public virtual onlyAdmin whenPaused{
        _unpause();
    }

}