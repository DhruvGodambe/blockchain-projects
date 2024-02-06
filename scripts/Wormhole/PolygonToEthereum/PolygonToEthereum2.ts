//Run this script in Goerli testnet

import { getEmitterAddressEth, parseSequenceFromLogEth, tryNativeToHexString } from "@certusone/wormhole-sdk";

const hre = require("hardhat");
const {ethers} = require("hardhat");    

const main = async () => {
    
    const enochAddress = "0xfdf8262ffa014c84bd4818b0daa0abe7b2ab03f6";
    const goerliBridgeAddress = "0xF890982f9310df57d00f659cf4fd87e65adEd8d7";
    const mumbaiBridgeAddress = "0x377D55a7928c046E18eEbb61977e714d2a76472a";

    const BridgeInteractAddressMumbai = "0x24901bee51b1254147Fd74a03739C457E7578338";
    const BridgeInteractAddressGoerli = "0x7EB3798B9d3283F5342119a697B3FAfBF3378FCe";

    const BridgeInteract = await ethers.getContractFactory("BridgeInteract");
    const bridgeInteractMumbai = await BridgeInteract.attach(
        BridgeInteractAddressMumbai // The deployed contract address
    );

    const bridgeInteractGoerli = await BridgeInteract.attach(
        BridgeInteractAddressGoerli
    );

    
    // IMPORTANT: NEED TX HASH
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-testnet-rpc.allthatnode.com:8545");
    const txReceipt = await provider.waitForTransaction(
      "0xd0e819b3d2742a67ac7346e46c75665592222a89ebe4429d7f11cc5edf3cccb3" //Paste the tx hash of transfer function call from EthereumToPolygon1.ts script after executing
    );
    console.log(txReceipt);


    /*
    * GOERLI
    */

    console.log("\n<------------------Getting VAA------------------------->");

    // function -> Getting VAA
    // STEP-3
    const restAddress = "https://wormhole-v2-testnet-api.certus.one";
    const chainId = 5;
    const bridgeAddress = "0x0CBE91CF822c73C2315FB05100C2F714765d5c20";
    const emitterAddr = getEmitterAddressEth(mumbaiBridgeAddress);
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