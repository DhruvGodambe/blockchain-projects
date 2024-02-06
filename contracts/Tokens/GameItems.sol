// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameItems is ERC1155Supply, Ownable {
    uint256 public constant GOLD = 0;
    uint256 public constant ELIXIR = 1;
    uint256 public constant THORS_HAMMER = 2;
    uint256 public constant SWORD = 3;
    uint256 public constant SHIELD = 4;

    constructor()
        ERC1155("ipfs://QmNxbxKW8ERM32KAJiVn5aCk5khZMuKugTNu7zdjy64WWo/")
    {
        _mint(msg.sender, GOLD, 10 ** 18, "");
        _mint(msg.sender, ELIXIR, 10 ** 27, "");
        _mint(msg.sender, THORS_HAMMER, 1, "");
        _mint(msg.sender, SWORD, 10 ** 9, "");
        _mint(msg.sender, SHIELD, 10 ** 9, "");
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    function uri(uint256 _id) public view override returns (string memory) {
        /**
         * @dev checks whether any token exist with a given id, or not.
         */
        require(exists(_id), "URI: nonexistent token");
        return
            string(
                abi.encodePacked(super.uri(_id), Strings.toString(_id), ".json")
            );
    }
}
