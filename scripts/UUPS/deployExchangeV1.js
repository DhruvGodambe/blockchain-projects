const { ethers, upgrades} = require("hardhat");
const hre = require("hardhat");

const Book = require("../NFTMarketplace/Addresses.json");

const mintingFactoryAddress = Book.MINTING_FACTORY_ADDRESS;
const adminRegistryAddress = Book.ADMIN_REGISTRY_ADDRESS;
const treasuryAddress = Book.TREASURY_ADDRESS;

const main = async () => {

    const exchangeCore = await hre.ethers.getContractFactory("ExchangeCore");
    console.log("Deploying ExchangeCore...");

    const ExchangeCoreV1 = await exchangeCore.deploy();
    await ExchangeCoreV1.deployed();

    console.log("ExchangeCore deployed");

    console.log("ExchangeCoreV1 Contract deployed to: ", ExchangeCoreV1.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });