// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./MinimalForwarder.sol";

contract MockToken is ERC20, ERC2771Context {
    address public owner;

    modifier onlyOwner() {
        require(_msgSender() == owner, "Owner required");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        MinimalForwarder forwarder
    ) ERC20(_name, _symbol) ERC2771Context(address(forwarder)) {
        _mint(_msgSender(), 1000000000000000000000000);
        owner = msg.sender;
    }

    function mint(address _userAddress, uint256 _amount) public {
        _mint(_userAddress, _amount);
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ERC2771Context)
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
        override(Context, ERC2771Context)
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
