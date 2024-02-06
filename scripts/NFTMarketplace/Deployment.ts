import { Address } from "cluster";

const { ethers} = require("hardhat");
const hre = require("hardhat");

const fs = require('fs');
const { writeFileSync } = require("fs");
const path = require('path');

/*
marketplaceDeployment.ts requirements:
1. deploy adminregistry 
2. set admin addresses
3. deploy mintingfactory
4. deploy exchangeCore
5. set exchange address in minting factory
*/

const deployment = async () => {

    const accounts = await ethers.getSigners();
    const admin  = accounts[0];
    const treasuryAddress = "0x404DbBbD516d101b41Ce1671C9e5D0766272d047";
    
    console.log("Deploying Admin Registry...");

    const AdminRegistry = await hre.ethers.getContractFactory("AdminRegistry");
    const adminRegistry = await AdminRegistry.deploy(admin.address, treasuryAddress);
    console.log("Admin address : ", admin.address);
    console.log("Treasury address : ", treasuryAddress);
    
    await adminRegistry.deployed();
    console.log("AdminRegistry address : ", adminRegistry.address);
    const tx = await adminRegistry.isAdmin(admin.address);
    console.log(admin.address, " is the admin of Admin Registry? ", tx);

    console.log("<<<<=====================================================>>>>");

    console.log("Deploying Minting Factory...");
    
    const MintingFactory = await hre.ethers.getContractFactory("MintingFactory");
    const mintingFactory = await MintingFactory.deploy(adminRegistry.address);    
    await mintingFactory.deployed();
    console.log("Minting Factory address : ", mintingFactory.address);

    console.log("<<<<=====================================================>>>>");

    console.log("Deploying Exchange Core...");

    const ExchangeCore = await hre.ethers.getContractFactory("ExchangeCore");
    const exchangeCore = await ExchangeCore.deploy(mintingFactory.address, 
        adminRegistry.address, 
        treasuryAddress
    );    
    await exchangeCore.deployed();
    console.log("Exchange Core address : ", exchangeCore.address);

    console.log("<<<<=====================================================>>>>");

    console.log("Setting Exchange Address in Minting Factory");

    let tx1 = await mintingFactory.updateExchangeAddress(exchangeCore.address);
    // console.log("Update Exchange Address tx : ", tx1);

    const receipt1 = await tx1.wait();
    let event = receipt1.events?.find((event:any) => event.event === "ExchangeAddressChanged");
    console.log("Updated Exchange Address is : ", event?.args.newExchange);

    console.log("<<<<=====================================================>>>>");

    console.log("Deploying Enoch Token...");
    
    const EnochToken = await hre.ethers.getContractFactory("Enoch");
    const enochToken = await EnochToken.deploy();    
    await enochToken.deployed();
    console.log("Enoch Token address : ", enochToken.address);

    console.log("<<<<=====================================================>>>>");

    
    let ADMIN_ADDRESS = admin.address;
    let TREASURY_ADDRESS = treasuryAddress;
    let ADMIN_REGISTRY_ADDRESS = adminRegistry.address;
    let MINTING_FACTORY_ADDRESS = mintingFactory.address;
    let EXCHANGE_CORE_ADDRESS = exchangeCore.address;
    let ENOCHTOKEN_ADDRESS = enochToken.address;
            
            
            console.log("Writing a new file to store Marketplace address...");
            
            await writeFileSync(
              path.join(__dirname, 'Addresses.json'),
              JSON.stringify(
                {
                  ADMIN_ADDRESS,
                  TREASURY_ADDRESS,
                  ADMIN_REGISTRY_ADDRESS,
                  MINTING_FACTORY_ADDRESS,
                  EXCHANGE_CORE_ADDRESS,
                  ENOCHTOKEN_ADDRESS
                },
                null,
                2
                )
                );
                
            console.log("<=====  Written ADDRESSES in marketplaceAddress.json  =====>");


      return({ADMIN_ADDRESS,
        TREASURY_ADDRESS,
        ADMIN_REGISTRY_ADDRESS,
        MINTING_FACTORY_ADDRESS,
        EXCHANGE_CORE_ADDRESS,
        ENOCHTOKEN_ADDRESS
      });



};

const main = async () => {
      await deployment();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });