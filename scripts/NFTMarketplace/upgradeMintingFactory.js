const { ethers, upgrades } = require("hardhat");

const main = async () => {
    [admin, account1] = await ethers.getSigners();
    console.log("Admin address : ", admin.address);
    // console.log("Account1 address : ", account1.address); 0xaC099D7d6057B7871D1076f2600e1163643d0822


    const MintingFactoryV1 = await hre.ethers.getContractFactory("NFTMintingFactory");
    console.log("Deploying ERC721 Minting Factory...");
    const nftFactoryV1 = await upgrades.deployProxy(MintingFactoryV1, {
        initializer : "initialize",
    });
    await nftFactoryV1.deployed();
    // console.log("NFT Factory V1: ", nftFactoryV1);
    console.log("Contract deployed to: ", nftFactoryV1.address);
    console.log("ProxyAdmin address: ",nftFactoryV1.deployTransaction.to);

    //-----------------------------------------------------------------//

   const MintingFactoryV2 = await ethers.getContractFactory("NFTMintingFactoryV2");
   console.log("Upgrading ERC721MintingFactoryV1 contract...");
   let upgrade = await upgrades.upgradeProxy(nftFactoryV1.address, MintingFactoryV2, {
    initializer : "initialize",
    });
   console.log("V1 Upgraded to V2");
   console.log("Implementation V2 Contract Deployed To:", upgrade.address);
   console.log("upgrade:",upgrade);

   //--------------------------------------------------------------------//

//    let collectionAddress = await nftFactory.createNFTContract("BlockNormandyNew", "BNN");
//         console.log("Collection created");

//         const receipt = await collectionAddress.wait();
//         console.log("Receipt", receipt);
//         nftContract = receipt.events[0].args.nftContract;
        
//         console.log("Event",receipt.events[0].args);
//         console.log("NFT contract:", nftContract);
        
        // nftContractInstance = await new ethers.Contract(nftContract, NFTContractabi.abi, admin);
        // console.log("Contract Address: ", nftContract);
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