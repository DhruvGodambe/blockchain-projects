// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Airdrop is Ownable, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter public _airDropCounter;

    IERC721 public airDropNFt;
    string public name;

    event Airdroped(
        address _from,
        uint256 _airDropCounter,
        uint256 _totalAddress,
        uint256 _totalTokenIds,
        uint256 _timestamp
    );

    constructor(address _airDropNft, string memory _name) {
        airDropNFt = IERC721(_airDropNft);
        name = _name;
    }

    function airDropBatch(
        address[] calldata _recipients,
        uint256[] calldata _tokenIds
    ) public onlyOwner whenNotPaused returns (bool) {
        uint256 totalAddress = _recipients.length;
        uint256 totalTokenIds = _tokenIds.length;
        require(
            totalAddress == totalTokenIds,
            "recipients and tokenIds are diffrent length"
        );

        _airDropCounter.increment();

        for (uint256 i = 0; i < totalAddress; i++) {
            airDropNFt.safeTransferFrom(
                msg.sender,
                _recipients[i],
                _tokenIds[i]
            );
        }

        emit Airdroped(
            msg.sender,
            _airDropCounter.current(),
            totalAddress,
            totalTokenIds,
            block.timestamp
        );

        return true;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
