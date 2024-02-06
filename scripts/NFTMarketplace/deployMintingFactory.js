const { ethers, upgrades } = require("hardhat");

const main = async () => {
    [admin] = await ethers.getSigners();
    console.log("Admin address : ", admin.address);

    const mintingFactoryContract = await hre.ethers.getContractFactory("MintingFactory");
    console.log("Deploying ERC721 Minting Factory Proxy...");
    const mintingFactoryProxy = await upgrades.deployProxy(mintingFactoryContract, {
        initializer : "initialize",
    });
    await mintingFactoryProxy.deployed();
    console.log("Proxy contract deployed at : ", mintingFactoryProxy.address);
    console.log("Minting Factory Proxy  : ", mintingFactoryProxy);


}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

runMain();