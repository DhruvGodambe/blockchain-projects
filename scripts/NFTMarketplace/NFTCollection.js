const { ethers } = require("hardhat");

const main = async () => {
    const accounts = await ethers.getSigners();

    owner = accounts[0];
    user = accounts[1];
    tresasurer = accounts[9];

    ownerAddress = await accounts[0].getAddress();
    userAddress = await accounts[1].getAddress();
    treasuryAddress = await accounts[9].getAddress();

    // Admin Registry
    const AdminRegistry = await ethers.getContractFactory(
        "AdminRegistry",
        owner
    );
    const adminRegistry = await AdminRegistry.deploy(
        ownerAddress,
        treasuryAddress
    );
    await adminRegistry.deployed();
    const aRegistryAddress = adminRegistry.address;

    //NFT collection

    const name = "Friday";
    const symbol = "FRI";
    const baseURI = "ipfs://";

    const NFTCollection = await ethers.getContractFactory(
        "NFTCollection",
        owner
    );
    const nftCollection = await NFTCollection.deploy(
        name,
        symbol,
        aRegistryAddress,
        baseURI
    );
    const collection = await nftCollection.deployed();

    console.log(collection);
    console.log(`NFTCollection Address --> ${collection.address}`);

    console.log("\n---------- Calling tokenURI ----------\n");

    const tokenId = 10;
    const tx1 = await collection.connect(owner).tokenURI(tokenId);
    console.log(`tokenURI --> ${tx1}`);

    // compiler throws an error while calling internal function.
    // console.log("\n---------- Calling _setbaseURI ----------\n");

    // const newURI = "ipfs://newURI/";

    // const tx2 = await collection.connect(owner)._setbaseURI(newURI);
    // const tx2Receipt = await tx2.wait();

    // console.log(`New Base URI --> ${tx2Receipt}`);

    console.log("\n---------- Calling mintNewNFT ----------\n");

    const newTokenId = 15;
    const tx3 = await collection.connect(owner).mintNewNFT(newTokenId);
    const tx3Receipt = await tx3.wait();

    const newMintedNFTId = tx3Receipt.events[0].args.tokenId.toString();

    console.log(`New minted NFT Id is --> ${newMintedNFTId}\n`);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
