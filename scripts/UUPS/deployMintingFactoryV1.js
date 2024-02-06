const { ethers, upgrades} = require("hardhat");
const hre = require("hardhat");

const Book = require("../NFTMarketplace/Addresses.json");

const main = async () => {

    const nftMintingFactory = await hre.ethers.getContractFactory("MintingFactory");
    console.log("Deploying NFT Minting Factory V1...");

    const MintingFactoryV1 = await nftMintingFactory.deploy();
    await MintingFactoryV1.deployed();

    console.log("Minting Factory V1 deployed");

    console.log("Minting Factory V1 Contract deployed to: ", MintingFactoryV1.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });