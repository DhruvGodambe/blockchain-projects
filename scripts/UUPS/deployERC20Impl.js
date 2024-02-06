const { ethers, upgrades} = require("hardhat");
const hre = require("hardhat");

const main = async () => {

    const loveImpl = await hre.ethers.getContractFactory("Love");
    console.log("Deploying Love Implementation Contract...");

    const LoveImpl = await loveImpl.deploy();
    await LoveImpl.deployed();

    console.log("Love Impl deployed");

    console.log("Love Impl Contract deployed to: ", LoveImpl.address);
    // console.log(LoveImpl);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });