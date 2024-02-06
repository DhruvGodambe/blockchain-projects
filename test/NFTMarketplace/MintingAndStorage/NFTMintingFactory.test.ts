import { ethers } from "hardhat";
import { assert, expect } from "chai";
import { Signer } from "ethers";
import {
    AdminRegistry__factory,
    AdminRegistry,
    NFTMintingFactory__factory,
    NFTMintingFactory,
} from "../../../typechain-types";

describe("NFTMintingFactory", () => {
    let accounts: Signer[],
        owner: Signer,
        user: Signer,
        user2: Signer,
        treasurer: Signer,
        exchange: Signer;
    let ownerAddress: string,
        userAddress: string,
        user2Address: string,
        exchangeAddress: string,
        treasuryAddress: string;
    let NFTMintingFactory: NFTMintingFactory__factory,
        nftMintingFactory: NFTMintingFactory,
        AdminRegistry: AdminRegistry__factory,
        adminRegistry: AdminRegistry;

    let aRegistryAddress: string;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        owner = accounts[0];
        user = accounts[1];
        user2 = accounts[2];
        exchange = accounts[8];
        treasurer = accounts[9];

        ownerAddress = await accounts[0].getAddress();
        userAddress = await accounts[1].getAddress();
        user2Address = await accounts[2].getAddress();
        treasuryAddress = await accounts[9].getAddress();
        exchangeAddress = await accounts[8].getAddress();

        // Admin Registry

        AdminRegistry = (await ethers.getContractFactory(
            "AdminRegistry"
        )) as AdminRegistry__factory;
        adminRegistry = await AdminRegistry.deploy(
            ownerAddress,
            treasuryAddress
        );
        await adminRegistry.deployed();
        aRegistryAddress = adminRegistry.address;

        // NFTMinting Factory

        NFTMintingFactory = (await ethers.getContractFactory(
            "NFTMintingFactory"
        )) as NFTMintingFactory__factory;
        nftMintingFactory = await NFTMintingFactory.deploy(aRegistryAddress);
        await nftMintingFactory.deployed();

        // Update Exchange Address
        const updateExchangeAddress = await nftMintingFactory
            .connect(owner)
            .updateExchangeAddress(exchangeAddress);
        await updateExchangeAddress.wait();
    });

    it("should set adminRegistry addresses correctly", async () => {
        const adminRegistry = await nftMintingFactory
            .connect(owner)
            .adminRegistry();

        assert.equal(adminRegistry, aRegistryAddress);
    });

    it("should set exchang addresses correctly", async () => {
        const mewExchangeAddress = await nftMintingFactory
            .connect(owner)
            .exchangeAddress();

        assert.equal(exchangeAddress, mewExchangeAddress);
    });

    it("Only Admin can create NFT Collection", async () => {
        const name: string = "Friday";
        const symbol: string = "FRI";
        const baseURI: string = "ipfs://";

        const tx1 = await nftMintingFactory
            .connect(owner)
            .createNFTCollection(name, symbol, baseURI);
        const tx1Receipt = await tx1.wait();

        const tx1Name = tx1Receipt.events![1].args!.name;
        const tx1Symbol = tx1Receipt.events![1].args!.symbol;

        assert.equal(name, tx1Name);
        assert.equal(symbol, tx1Symbol);
    });

    it("Only Exchange can call mint NFT", async () => {
        const name: string = "Friday";
        const symbol: string = "FRI";
        const baseURI: string = "ipfs://";
        const tokenId: number = 10;
        const nftId: string = "0x00";

        const tx2 = await nftMintingFactory
            .connect(owner)
            .createNFTCollection(name, symbol, baseURI);
        const tx2Receipt = await tx2.wait();

        const NFTCollection = tx2Receipt.events![1].args!.nftCollection;

        const tx3 = await nftMintingFactory
            .connect(exchange)
            .mintNFT(NFTCollection, tokenId, nftId);
        const tx3Receipt = await tx3.wait();

        const tx3NFTCollection = tx3Receipt.events![1].args!.nftCollection;
        const tx3TokenId = tx3Receipt.events![1].args!.tokenId;

        assert.equal(NFTCollection, tx3NFTCollection);
        assert.equal(tokenId, tx3TokenId);
    });

    it("Only Exchange can update Owner", async () => {
        const name: string = "Friday";
        const symbol: string = "FRI";
        const baseURI: string = "ipfs://";
        const tokenId: number = 10;
        const nftId: string = "0x00";

        const tx2 = await nftMintingFactory
            .connect(owner)
            .createNFTCollection(name, symbol, baseURI);
        const tx2Receipt = await tx2.wait();

        const NFTCollection = tx2Receipt.events![1].args!.nftCollection;

        const tx3 = await nftMintingFactory
            .connect(owner)
            .updateExchangeAddress(exchangeAddress);
        await tx3.wait();

        const tx4 = await nftMintingFactory
            .connect(exchange)
            .mintNFT(NFTCollection, tokenId, nftId);
        await tx4.wait();

        const newOwner = user2Address;

        const tx5 = await nftMintingFactory
            .connect(exchange)
            .updateOwner(NFTCollection, newOwner, tokenId);
        const tx5Receipt = await tx5.wait();

        const updatedOwner = tx5Receipt.events![0].args!.newOwner;

        expect(newOwner).to.equal(updatedOwner);
    });

    it("Only Admin can update Exchange Address", async () => {
        const newExAddress = exchangeAddress;
        const tx1 = await nftMintingFactory
            .connect(owner)
            .updateExchangeAddress(newExAddress);
        const tx1Receipt = await tx1.wait();

        const updatedExAddress = tx1Receipt.events![0].args!.newExchange;

        assert.equal(newExAddress, updatedExAddress);
    });

    it("Should get Collection For Owner", async () => {
        const name: string = "Friday";
        const symbol: string = "FRI";
        const baseURI: string = "ipfs://";

        const tx1 = await nftMintingFactory
            .connect(owner)
            .createNFTCollection(name, symbol, baseURI);
        const tx1Receipt = await tx1.wait();

        const NFTCollection = tx1Receipt.events![1].args!.nftCollection;

        const tx2 = await nftMintingFactory
            .connect(owner)
            .getCollectionForOwner(ownerAddress);

        const ownerToCollection = tx2[0];

        expect(NFTCollection).to.equal(ownerToCollection);
    });
});
