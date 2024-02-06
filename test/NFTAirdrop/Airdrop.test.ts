import { ethers } from "hardhat";
import { assert, expect } from "chai";
import {
    MyNFT__factory,
    MyNFT,
    Airdrop__factory,
    Airdrop,
} from "../../typechain-types";
import { Signer } from "ethers";


describe("Airdrop", () => {
    let MyNFT: MyNFT__factory,
        myNFT: MyNFT,
        Airdrop: Airdrop__factory,
        airdrop: Airdrop;
    let ownerAddress: string,
        user1Address: string,
        user2Address: string,
        user3Address: string;

    let MyNFTAddress: string, airdropAddress: string;

    let accounts: Signer[],
        owner: Signer,
        user1: Signer,
        user2: Signer,
        user3: Signer;

    let name: string = "ENOCH Airdrop";

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        owner = accounts[0];
        user1 = accounts[1];

        ownerAddress = await accounts[0].getAddress();
        user1Address = await accounts[1].getAddress();
        user2Address = await accounts[2].getAddress();
        user3Address = await accounts[3].getAddress();

        //NFT contract

        MyNFT = (await ethers.getContractFactory("MyNFT")) as MyNFT__factory;
        myNFT = await MyNFT.deploy();
        await myNFT.deployed();
        MyNFTAddress = myNFT.address;

        // Airdrop Contract

        Airdrop = (await ethers.getContractFactory(
            "Airdrop"
        )) as Airdrop__factory;
        airdrop = await Airdrop.deploy(MyNFTAddress, name);
        await airdrop.deployed();
        airdropAddress = airdrop.address;
    });

    describe("Constructor ", () => {
        it("Should set Owner correctly", async () => {
            const owner = await airdrop.connect(user1).owner();

            assert.equal(owner, ownerAddress);
        });

        it("Should set NFT contract address correctly", async () => {
            const nftAddress = await airdrop.connect(owner).airDropNFt();

            assert.equal(nftAddress, MyNFTAddress);
        });

        it("Should set Name correctly", async () => {
            const airdropName = await airdrop.connect(owner).name();

            assert.equal(airdropName, name);
        });
    });

    describe("Paused function", () => {
        it("Should return bool while calling paused", async () => {
            const pausedFalse = await airdrop.connect(owner).paused();

            expect(pausedFalse).to.be.false;
        });

        it("Should return true while calling paused", async () => {
            const tx1 = await airdrop.connect(owner).pause();
            const pausedTrue = await airdrop.connect(owner).paused();

            expect(pausedTrue).to.be.true;
        });
    });

    describe("Airdrop Counter", () => {
        it("Should check airdropCounter", async () => {
            const counter = await airdrop.connect(owner)._airDropCounter();
            const currentCounter: string = "0";

            assert.equal(counter.toString(), currentCounter);
        });
    });

    describe("Owner", () => {
        it("Only Owner can transfer ownership", async () => {
            const newOwner = await airdrop
                .connect(owner)
                .transferOwnership(user1Address);
            const receipt = await newOwner.wait();

            const updatedOwner: string = receipt.events![0].args!.newOwner;

            assert.equal(user1Address, updatedOwner);
        });

        it("Only Owner can renounce ownership", async () => {
            const renounce = await airdrop.connect(owner).renounceOwnership();
            const receipt = await renounce.wait();

            const renouncedOwner: string = receipt.events![0].args!.newOwner;
            const zeroThAddress: string =
                "0x0000000000000000000000000000000000000000";

            assert.equal(renouncedOwner, zeroThAddress);
        });
    });

    describe("Airdrop Batch", () => {
        it("Should transfer nfts to their respective new owner", async () => {
            // mint 3 token
            const tx1 = await myNFT.connect(owner).safeMint(ownerAddress);
            await tx1.wait();

            const tx2 = await myNFT.connect(owner).safeMint(ownerAddress);
            await tx2.wait();

            const tx3 = await myNFT.connect(owner).safeMint(ownerAddress);
            await tx3.wait();

            const tx4 = await myNFT.connect(owner).approve(airdropAddress, 0);
            await tx4.wait();

            const tx5 = await myNFT.connect(owner).approve(airdropAddress, 1);
            await tx5.wait();

            const tx6 = await myNFT.connect(owner).approve(airdropAddress, 2);
            await tx6.wait();

            let _recipients: string[] = [
                user1Address,
                user2Address,
                user3Address,
            ];
            let _tokenIds: number[] = [0, 1, 2];

            const tx7 = await airdrop
                .connect(owner)
                .airDropBatch(_recipients, _tokenIds);
            const tx7Receipt = await tx7.wait();

            const fromAddress = tx7Receipt.events![6].args!._from;
            const totalAddress = tx7Receipt.events![6].args!._totalAddress;
            const totalTokens = tx7Receipt.events![6].args!._totalTokenIds;

            expect(ownerAddress).to.equal(fromAddress.toString());
            expect(_recipients.length).to.equal(totalAddress);
            expect(_tokenIds.length).to.equal(totalTokens);
        });
    });
});
