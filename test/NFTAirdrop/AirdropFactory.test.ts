import { ethers } from "hardhat";
import { assert, expect } from "chai";
import {
    AdminRegistry__factory,
    AdminRegistry,
    MyNFT__factory,
    MyNFT,
    AirdropFactory__factory,
    AirdropFactory,
} from "../../typechain-types";
import { Signer } from "ethers";

describe("Airdrop Factory", () => {
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

    let name: string = "ENOCH Airdrop";

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        owner = accounts[0];
        user1 = accounts[1];

        ownerAddress = await accounts[0].getAddress();
        user1Address = await accounts[1].getAddress();
        user2Address = await accounts[2].getAddress();
        user3Address = await accounts[3].getAddress();
        treasuryAddress = await accounts[9].getAddress();

        // AdminRegistry

        AdminRegistry = (await ethers.getContractFactory(
            "AdminRegistry"
        )) as AdminRegistry__factory;
        adminRegistry = await AdminRegistry.deploy(
            ownerAddress,
            treasuryAddress
        );
        await adminRegistry.deployed();
        registryAddress = adminRegistry.address;

        // NFTContract

        MyNFT = (await ethers.getContractFactory("MyNFT")) as MyNFT__factory;
        myNFT = await MyNFT.deploy();
        await myNFT.deployed();
        myNFTAddress = myNFT.address;

        // AirdropFactory Contract

        AirdropFactory = (await ethers.getContractFactory(
            "AirdropFactory"
        )) as AirdropFactory__factory;
        airdropFactory = await AirdropFactory.deploy(registryAddress);
        await airdropFactory.deployed();
        airdropFactoryAddress = airdropFactory.address;
    });

    describe("Constructor", () => {
        it("Should set AdminRegistry contract address correctly", async () => {
            const adminRegistry = await airdropFactory
                .connect(owner)
                .adminRegistry();

            assert.equal(adminRegistry, registryAddress);
        });
    });

    describe("newAirdrop", () => {
        it("Only Admin can call newAirdrop function", async () => {
            //here owner is admin
            const newAirdrop = await airdropFactory
                .connect(owner)
                .newAirdrop(myNFTAddress, name);
            const newAirdropReceipt = await newAirdrop.wait();

            const deployedName = newAirdropReceipt.events![1].args!._name;
            const nftAddress = newAirdropReceipt.events![1].args!._nftAddress;
            const deployedTime = newAirdropReceipt.events![1].args!._timestamp;

            let date = new Date(deployedTime * 1000).toLocaleDateString(
                "de-DE"
            );

            const currentDate = new Date().toLocaleDateString("de-DE");

            assert.equal(deployedName, name);
            assert.equal(nftAddress, myNFTAddress);
            assert.equal(date, currentDate);
        });
    });

    describe("NFT addres to Airdrop address", () => {
        it("Should return airdrop contract address", async () => {
            const newAirdrop = await airdropFactory
                .connect(owner)
                .newAirdrop(myNFTAddress, name);
            const newAirdropReceipt = await newAirdrop.wait();

            let index: number = 0;
            const tx1 = await airdropFactory
                .connect(owner)
                .nftToAirdrop(myNFTAddress, index);

            let airdropAddress = newAirdropReceipt.events![1].args!._airdrop;

            expect(tx1).to.be.equal(airdropAddress);
        });
    });
});
