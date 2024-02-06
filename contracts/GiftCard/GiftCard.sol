// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./../NFTMarketplace/Interface/IERC20.sol";
import "./../Registry/IAdminRegistry.sol";

contract GiftCard is
    Initializable
{

    using SafeMath for uint256;
    address public factory;
    address public adminRegistry;


    event SingleTokenTransfer(address token, uint256 amount, address to);
    event MultiTokenTransfer(address[] tokens, uint256[] amounts, address to);
    event SingleTokenApproval(address token, uint256 amount, address approvedTo);
    event MultiTokenApproval(address[] tokens, uint256[] amounts, address approvedTo);

    function initialize(address _adminRegistry) external initializer {
        factory = msg.sender;
        adminRegistry = _adminRegistry;
    console.log("msg.sender is : ", msg.sender);
    console.log("address(this) is : ", address(this));
    }

    modifier onlyAdmin() {
        require(
            IAdminRegistry(adminRegistry).isAdmin(msg.sender),
            "Only Admin can call this!"
        );
        _;
    }


    function singleTokenTransfer
    (
        address _token,
        uint256 _amount,
        address _to
    ) public onlyAdmin returns (bool)
    {
        bool success = IERC20(_token).transfer(_to, _amount);

        emit SingleTokenTransfer(_token, _amount, _to);
        return success ;
    }


    function multiTokenTransfer
    (
        address[] memory _tokens,
        uint256[] memory _amounts,
        address _to
    ) public onlyAdmin returns(bool)
    {
        bool success;

        for (uint i = 0; i < _tokens.length; i++) {
            success = IERC20(_tokens[i]).transfer(_to, _amounts[i]);
        }
        emit MultiTokenTransfer(_tokens, _amounts, _to);
        return success;
    }

    function setSingleTokenApproval
    (
        address _token,
        uint256 _amount,
        address _spender
    ) public onlyAdmin returns(bool) 
    {
        bool success = IERC20(_token).approve(_spender, _amount);

        emit SingleTokenApproval(_token, _amount, _spender);
        return success;
    }

    function setMultiTokenApproval
    (
        address[] memory _tokens,
        uint256[] memory _amounts,
        address _spender
    ) public onlyAdmin returns(bool)
    {
        bool success;

        for (uint i = 0; i < _tokens.length; i++) {
            success = IERC20(_tokens[i]).approve(_spender, _amounts[i]);
        }

        emit MultiTokenApproval(_tokens, _amounts, _spender);
        return success;
    }
    
    function getBalance
    (
        address _token
    ) public view returns (uint256) 
    {
        return IERC20(_token).balanceOf(address(this));
    }

}