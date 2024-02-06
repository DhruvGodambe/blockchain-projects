//Run this script in Goerli testnet

import { getEmitterAddressEth, parseSequenceFromLogEth, tryNativeToHexString } from "@certusone/wormhole-sdk";

const hre = require("hardhat");
const {ethers} = require("hardhat");    

const main = async () => {
    
    const enochAddressFuji = "0x6a194738c7C560d8b43988fBb8cb8AC5308646D4";
    const goerliBridgeAddress = "0xF890982f9310df57d00f659cf4fd87e65adEd8d7"; //Token Bridge
    const fujiBridgeAddress = "0x61E44E506Ca5659E6c0bba9b678586fA2d729756";   //Token Bridge

    const BridgeInteractAddressGoerli = "0x7EB3798B9d3283F5342119a697B3FAfBF3378FCe"; // The deployed contract address
    const BridgeInteractAddressFuji = "0x930CcF606e0d1eeC7ce9142C33171229791C0dA3";   // The deployed contract address

    const BridgeInteract = await ethers.getContractFactory("BridgeInteract");
    const bridgeInteractMumbai = await BridgeInteract.attach(
        BridgeInteractAddressFuji 
    );

    const bridgeInteractGoerli = await BridgeInteract.attach(
        BridgeInteractAddressGoerli
    );

    
    // IMPORTANT: NEED TX HASH
    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const txReceipt = await provider.waitForTransaction(
      "0xa6e17b64f3806c1799ddda6a2e1dec1f92ccf0a48b7d34214c4f65b6fdaa6f78" //Paste the tx hash of transfer function call from EthereumToPolygon1.ts script after executing
    );
    console.log(txReceipt);


    /*
    * Execute on GOERLI
    */

    console.log("\n<------------------Getting VAA------------------------->");

    // function -> Getting VAA
    // STEP-3
    const restAddress = "https://wormhole-v2-testnet-api.certus.one";
    const chainId = 6; //Wormhole Chain ID - Core Bridge
    const bridgeAddress = "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C"; //Fuji
    const emitterAddr = getEmitterAddressEth(fujiBridgeAddress);
    console.log("Emitter Address:   ", emitterAddr);
    
    const seq = parseSequenceFromLogEth(txReceipt, bridgeAddress);
    console.log("Sequence:  ", seq);
    
    const vaaURL = `${restAddress}/v1/signed_vaa/${chainId}/${emitterAddr}/${seq}`;
    let vaaBytes = await (await fetch(vaaURL)).json();
    while (!vaaBytes.vaaBytes) {
        console.log("VAA not found, retrying in 5s!");
        await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardian pick up log and have VAA ready
        vaaBytes = await (await fetch(vaaURL)).json();
    }

    console.log(vaaBytes);
    console.log(typeof vaaBytes.vaaBytes);
    
    console.log(Buffer.from(vaaBytes.vaaBytes, "base64"));
    console.log(vaaBytes.vaaBytes);
    

    console.log("\n<------------------Complete Transfer function------------------------->");

    // function -> redeem
    // STEP-4
    // targetTokenBridge - 0xF890982f9310df57d00f659cf4fd87e65adEd8d7
    const completeTransferTx = await bridgeInteractGoerli.completeTransfer(
        Buffer.from(vaaBytes.vaaBytes, "base64")
    );

    const receipt = await completeTransferTx.wait();
    console.log(receipt);
    
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });