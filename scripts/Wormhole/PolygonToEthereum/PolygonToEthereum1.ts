//Run this script in Mumbai testnet

import { getEmitterAddressEth, parseSequenceFromLogEth, tryNativeToHexString } from "@certusone/wormhole-sdk";

const hre = require("hardhat");
const {ethers} = require("hardhat");    

const main = async () => {
    
    const enochAddressMumbai = "0xfdf8262ffa014c84bd4818b0daa0abe7b2ab03f6";
    const goerliBridgeAddress = "0xF890982f9310df57d00f659cf4fd87e65adEd8d7";
    const mumbaiBridgeAddress = "0x377D55a7928c046E18eEbb61977e714d2a76472a";

    const BridgeInteractAddressMumbai = "0x24901bee51b1254147Fd74a03739C457E7578338";
    const BridgeInteractAddressGoerli = "0x7EB3798B9d3283F5342119a697B3FAfBF3378FCe";

    const Enoch1 = await ethers.getContractFactory("Enoch1");
    const enochMumbai = await Enoch1.attach(
      enochAddressMumbai // The deployed contract address
    );

    const BridgeInteract = await ethers.getContractFactory("BridgeInteract");
    
    const bridgeInteractMumbai = await BridgeInteract.attach(
        BridgeInteractAddressMumbai // The deployed contract address
    );

    const bridgeInteractGoerli = await BridgeInteract.attach(
      BridgeInteractAddressGoerli
      );

      console.log("\n<------------------Approve Function------------------------->");

      //Approve
      const bridgeAmt = ethers.utils.parseUnits("7000", "18");
      const approveTx = await enochMumbai.approve(mumbaiBridgeAddress, bridgeAmt);
      const approveTxReceipt = await approveTx.wait();
      console.log(approveTxReceipt);


      console.log("\n<------------------Transfer Tokens Function------------------------->");


    //     address token, --->Enoch token's address in source chain
    //     uint256 amount,  --->Amount of Enoch tokens
    //     uint16 recipientChain, ---> Target chains's wormhole ChainID (Core Bridge)
    //     bytes32 recipient, --->Sender's Account Address
    //     uint256 arbiterFee, ---->Put 0
    //     uint32 nonce ---->Current nonce

    /*
    * EXECUTE ON MUMBAI
    */
    const transferTx = await bridgeInteractMumbai.transfer(
      enochAddressMumbai,
      2000,
      2,
      "0x000000000000000000000000aC099D7d6057B7871D1076f2600e1163643d0822",
      0,
      100
      );

      const transferTxReceipt = await transferTx.wait();
      console.log(transferTxReceipt);
    
    
    
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });