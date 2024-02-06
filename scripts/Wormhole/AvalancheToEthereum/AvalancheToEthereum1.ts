//Run this script in Fuji (Avalanche) testnet

import { getEmitterAddressEth, parseSequenceFromLogEth, tryNativeToHexString } from "@certusone/wormhole-sdk";

const hre = require("hardhat");
const {ethers} = require("hardhat");    

const main = async () => {
    
    const enochAddressFuji = "0x6a194738c7C560d8b43988fBb8cb8AC5308646D4";
    const goerliBridgeAddress = "0xF890982f9310df57d00f659cf4fd87e65adEd8d7";  //Token Bridge
    const fujiBridgeAddress = "0x61E44E506Ca5659E6c0bba9b678586fA2d729756";    //Token Bridge

    const BridgeInteractAddressFuji = "0x930CcF606e0d1eeC7ce9142C33171229791C0dA3"; // deployed BridgeInteract address
    const BridgeInteractAddressGoerli = "0x7EB3798B9d3283F5342119a697B3FAfBF3378FCe"; // deployed BridgeInteract address

    
    const BridgeInteract = await ethers.getContractFactory("BridgeInteract");
    const bridgeInteractFuji = await BridgeInteract.attach(
        BridgeInteractAddressFuji
        );
    const bridgeInteractGoerli = await BridgeInteract.attach(
        BridgeInteractAddressGoerli 
    );
            
            console.log("\n<------------------Approve Function------------------------->");
            
        //Approve calling through Enoch's interface
    const Enoch1 = await ethers.getContractFactory("Enoch1");
    const enochMumbai = await Enoch1.attach(
        enochAddressFuji 
    );
    const bridgeAmt = ethers.utils.parseUnits("2000", "18");
    const approveTx = await enochMumbai.approve(fujiBridgeAddress, bridgeAmt);
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
    * EXECUTE ON FUJI
    */
    const transferTx = await bridgeInteractFuji.transfer(
      enochAddressFuji,
      2000,
      2,
      "0x000000000000000000000000aC099D7d6057B7871D1076f2600e1163643d0822",
      0,
      2
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