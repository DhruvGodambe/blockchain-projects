// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MinimalForwarder.sol";

contract SimpleExchange is ERC2771Context {
    address public tokenAddress;
    mapping(address => uint256) public userDepositMapping;

    constructor(address _tokenAddress, MinimalForwarder forwarder)
        ERC2771Context(address(forwarder))
    {
        tokenAddress = _tokenAddress;
    }

    function deposit(uint256 _amount) external {
        userDepositMapping[_msgSender()] += _amount;
        IERC20(tokenAddress).transferFrom(_msgSender(), address(this), _amount);
    }

    function withdraw() external {
        uint256 amount = userDepositMapping[_msgSender()];
        require(amount > 0, "No amount to withdraw");
        userDepositMapping[_msgSender()] -= amount;
        IERC20(tokenAddress).transfer(_msgSender(), amount);
    }

    function _msgData()
        internal
        view
        virtual
        override(ERC2771Context)
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }

    function _msgSender()
        internal
        view
        virtual
        override(ERC2771Context)
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    //  new code
}
