import { ethers } from "hardhat";
import {
    AdminRegistry__factory,
    AdminRegistry,
    MyNFT__factory,
    MyNFT,
    AirdropFactory__factory,
    AirdropFactory,
} from "../../typechain-types";
import { Signer } from "ethers";

const main = async () => {
    let AdminRegistry: AdminRegistry__factory,
        adminRegistry: AdminRegistry,
        MyNFT: MyNFT__factory,
        myNFT: MyNFT,
        AirdropFactory: AirdropFactory__factory,
        airdropFactory: AirdropFactory;

    let accounts: Signer[], owner: Signer, user1: Signer, treasury: Signer;

    let ownerAddress: string,
        user1Address: string,
        user2Address: string,
        user3Address: string,
        treasuryAddress: string,
        registryAddress: string,
        myNFTAddress: string,
        airdropFactoryAddress: string;

    accounts = await ethers.getSigners();

    owner = accounts[0];
    user1 = accounts[1];

    ownerAddress = await accounts[0].getAddress();
    user1Address = await accounts[1].getAddress();
    user2Address = await accounts[2].getAddress();
    user3Address = await accounts[3].getAddress();
    treasuryAddress = await accounts[9].getAddress();

    // AdminRegistry
    console.log("\n---------- Deploying AdminRegistry Contract ----------");

    AdminRegistry = (await ethers.getContractFactory(
        "AdminRegistry"
    )) as AdminRegistry__factory;
    adminRegistry = await AdminRegistry.deploy(ownerAddress, treasuryAddress);
    await adminRegistry.deployed();
    registryAddress = adminRegistry.address;

    console.log(`AdminRegistry deployed at --> ${registryAddress}`);

    // NFTContract
    console.log("\n---------- Deploying NFT Contract ----------");

    MyNFT = (await ethers.getContractFactory("MyNFT")) as MyNFT__factory;
    myNFT = await MyNFT.deploy();
    await myNFT.deployed();
    myNFTAddress = myNFT.address;

    console.log(`\nMyNFT Address --> ${myNFTAddress}`);

    // AirdropFactory Contract
    console.log("\n---------- Deploying NFT Contract ----------");

    AirdropFactory = (await ethers.getContractFactory(
        "AirdropFactory"
    )) as AirdropFactory__factory;
    airdropFactory = await AirdropFactory.deploy(registryAddress);
    await airdropFactory.deployed();
    airdropFactoryAddress = airdropFactory.address;

    console.log(`\nAirdrop Factory Address --> ${airdropFactoryAddress}`);

    console.log("\n---------------------------------------------\n");

    let name: string = "ENOCH Airdrop";

    const tx1 = await airdropFactory
        .connect(owner)
        .newAirdrop(myNFTAddress, name);
    const tx1Receipt = await tx1.wait();

    let deployedAirdropAddress = tx1Receipt.events![1].args!._airdrop;
    let deployedTime = tx1Receipt.events![1].args!._timestamp;
    let airdropName = tx1Receipt.events![1].args!._name;

    let date = new Date(deployedTime * 1000);

    console.log(`Airdrop contract is deployed....`);
    console.log(`\nAirdrop contract address --> ${deployedAirdropAddress}`);
    console.log(`\nAirdrop contract name --> ${airdropName}`);
    console.log(
        `\nAirdrop contract deployed time --> ${date.toLocaleDateString(
            "en-GB"
        )}`
    );

    console.log("\n---------------------------------------------\n");

    let index: number = 0;
    const tx2 = await airdropFactory
        .connect(owner)
        .nftToAirdrop(myNFTAddress, index);

    console.log(`for given nft address airdrop address is --> ${tx2}`);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
