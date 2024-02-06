import { ethers } from "hardhat";
import {
    MyNFT__factory,
    MyNFT,
    Airdrop__factory,
    Airdrop,
} from "../../typechain-types";

const main = async () => {
    let MyNFT: MyNFT__factory,
        myNFT: MyNFT,
        Airdrop: Airdrop__factory,
        airdrop: Airdrop;

    let MyNFTAddress: string, airdropAddress: string;

    let name: string = "ENOCH Airdrop";

    const accounts = await ethers.getSigners();

    const owner = accounts[0];
    const user = accounts[1];

    const ownerAddress = await accounts[0].getAddress();
    const userAddress = await accounts[1].getAddress();
    const user2Address = await accounts[2].getAddress();
    const user3Address = await accounts[3].getAddress();

    // NFT Contract
    console.log("\n---------- Deploying NFT Contract ----------");

    MyNFT = (await ethers.getContractFactory("MyNFT")) as MyNFT__factory;
    myNFT = await MyNFT.deploy();
    await myNFT.deployed();
    MyNFTAddress = myNFT.address;

    console.log(`\nMyNFT Address --> ${MyNFTAddress}`);

    // Airdrop Contract
    console.log("\n---------- Deploying Airdrop Contract ----------");

    Airdrop = (await ethers.getContractFactory("Airdrop")) as Airdrop__factory;
    airdrop = await Airdrop.deploy(MyNFTAddress, name);
    await airdrop.deployed();
    airdropAddress = airdrop.address;

    console.log(`\nAirdrop contract Address --> ${airdropAddress}`);

    // console.log("\n---------- Calling safeMint ----------\n");

    // mint 3 token
    const tx1 = await myNFT.connect(owner).safeMint(ownerAddress);
    await tx1.wait();

    const tx2 = await myNFT.connect(owner).safeMint(ownerAddress);
    await tx2.wait();

    const tx3 = await myNFT.connect(owner).safeMint(ownerAddress);
    await tx3.wait();

    // console.log("\n---------- Calling approve function ----------\n");

    const tx4 = await myNFT.connect(owner).approve(airdropAddress, 0);
    await tx4.wait();

    const tx5 = await myNFT.connect(owner).approve(airdropAddress, 1);
    await tx5.wait();

    const tx6 = await myNFT.connect(owner).approve(airdropAddress, 2);
    await tx6.wait();

    console.log("\n---------- Calling airDropBatch ----------\n");

    let _recipients: string[] = [userAddress, user2Address, user3Address];
    let _tokenIds: number[] = [0, 1, 2];

    const tx7 = await airdrop
        .connect(owner)
        .airDropBatch(_recipients, _tokenIds);
    const tx7Receipt = await tx7.wait();

    const fromAddress = tx7Receipt.events![6].args!._from;
    const totalAddress = tx7Receipt.events![6].args!._totalAddress;
    const totalTokens = tx7Receipt.events![6].args!._totalTokenIds;
    const time = tx7Receipt.events![6].args!._timestamp;

    //convert unix timestamp into human readable form

    let date = new Date(time * 1000);

    console.log(`From --> ${fromAddress}`);
    console.log(`total Address --> ${totalAddress.toString()}`);
    console.log(`total Tokens --> ${totalTokens.toString()}`);
    console.log(`time airdrop happend --> ${date.toLocaleDateString("en-GB")}`);

    console.log(`\nHorray!, NFT's are Airdroped`);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
