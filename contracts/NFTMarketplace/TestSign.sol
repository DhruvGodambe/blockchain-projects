// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;


contract TestSign {


function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    
    function getMessageHash(
        string memory _message
    ) public pure returns (bytes memory) {
        return abi.encodePacked(_message);
    }


    function getEthSignedMessageHash(bytes memory _messageHash)
        public
        pure
        returns (bytes32)
    {
        string memory msgLength = uint2str(_messageHash.length);

        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n", msgLength, _messageHash)
            );
    }


    function verify(
        address _signer,
        bytes memory messageHash,
        bytes memory signature
    ) public pure returns (bool) {
        // bytes32 messageHash = getMessageHash(_message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {


            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

    }
}
