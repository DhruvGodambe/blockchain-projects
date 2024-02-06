import { ethers } from "hardhat";
import { assert, expect } from "chai";
import { Signer } from "ethers";
import {
    NFTCollection__factory,
    NFTCollection,
    AdminRegistry__factory,
    AdminRegistry,
} from "../../../typechain-types";

describe("NFT Collection", () => {
    let accounts: Signer[],
        owner: Signer,
        user1: Signer,
        user2: Signer,
        treasurer: Signer;

    let ownerAddress: string,
        user1Address: string,
        user2Address: string,
        treasuryAddress: string,
        adminRegistryAddress: string;

    let AdminRegistry: AdminRegistry__factory,
        adminRegistry: AdminRegistry,
        NFTCollection: NFTCollection__factory,
        nftCollection: NFTCollection;

    let name: string = "ENOCH Collection";
    let symbol: string = "ENOCH";
    let baseURI: string = "ipfs://ipfs.io/";

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        owner = accounts[0];
        user1 = accounts[1];
        user2 = accounts[2];
        treasurer = accounts[9];

        ownerAddress = await accounts[0].getAddress();
        user1Address = await accounts[1].getAddress();
        user2Address = await accounts[2].getAddress();
        treasuryAddress = await accounts[9].getAddress();

        // Admin Registry

        AdminRegistry = (await ethers.getContractFactory(
            "AdminRegistry"
        )) as AdminRegistry__factory;
        adminRegistry = await AdminRegistry.deploy(
            ownerAddress,
            treasuryAddress
        );
        await adminRegistry.deployed();
        adminRegistryAddress = adminRegistry.address;

        //NFTCollection

        NFTCollection = (await ethers.getContractFactory(
            "NFTCollection"
        )) as NFTCollection__factory;
        nftCollection = await NFTCollection.deploy(
            name,
            symbol,
            adminRegistryAddress,
            baseURI
        );
        await nftCollection.deployed();
    });

    describe("Constructor", () => {
        it("Should set name correctly", async () => {
            const getName = await nftCollection.connect(owner).name();

            assert.equal(name, getName);
        });

        it("Should set symbol correctly", async () => {
            const getSymbol = await nftCollection.connect(owner).symbol();

            assert.equal(symbol, getSymbol);
        });

        it("Should set baseURI correctly", async () => {
            const getBaseURI = await nftCollection.connect(owner).baseURI();

            assert.equal(baseURI, getBaseURI);
        });

        it("Should set Admin Registry Address correctly", async () => {
            const getRegistryAddress = await nftCollection
                .connect(owner)
                .adminRegistry();

            assert.equal(adminRegistryAddress, getRegistryAddress);
        });
    });

    describe("Token URI", () => {
        it("tokenURI function should return URI for given tokenId", async () => {
            let tokenId: string = "12";
            const newTokenURI = baseURI + tokenId;

            const tokenURI = await nftCollection
                .connect(owner)
                .tokenURI(tokenId);

            console.log(`tx--> ${tokenURI}\n\n`);
            console.log(newTokenURI);
            
            assert.equal(tokenURI, newTokenURI);
        });
    });

    // _setbaseURI is Internal function, therefore cannot be tested .

    describe("Mint New NFT", () => {
        it("only Minting Factory can call mintNewNFT function", async () => {
            //here onlyMintingFactory signet is owner

            let tokenId: number = 12;
            let nftId: string = "0x00";
            const mintNFT = await nftCollection
                .connect(owner)
                .mintNewNFT(tokenId, nftId);
            const minNFTReceipt = await mintNFT.wait();
            let newTokenId = minNFTReceipt.events![0].args!.tokenId.toString();

            assert.equal(tokenId, newTokenId);
        });
    });
});
