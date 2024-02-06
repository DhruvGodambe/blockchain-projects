import { ethers } from "hardhat";
import { assert, expect } from "chai";
import {
    WETHToken__factory,
    WETHToken,
    AdminRegistry__factory,
    AdminRegistry,
    NFTMintingFactory__factory,
    NFTMintingFactory,
    ExchangeCore__factory,
    ExchangeCore,
} from "../../../typechain-types";
import { BigNumber, Signer } from "ethers";

describe("ExchangeCore", () => {
    let accounts: Signer[],
        owner: Signer,
        user: Signer,
        user2: Signer,
        treasurer: Signer;

    let ownerAddress: string,
        userAddress: string,
        user2Address: string,
        treasuryAddress: string,
        mintingFactoryAddress: string,
        exchangeCoreAddress: string,
        aRegistryAddress: string,
        wETHAddress: string;

    let NFTMintingFactory: NFTMintingFactory__factory,
        nftMintingFactory: NFTMintingFactory,
        AdminRegistry: AdminRegistry__factory,
        adminRegistry: AdminRegistry,
        ExchangeCore: ExchangeCore__factory,
        exchangeCore: ExchangeCore,
        WETHToken: WETHToken__factory,
        wETHToken: WETHToken;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        owner = accounts[0];
        user = accounts[1];
        user2 = accounts[2];
        treasurer = accounts[9];

        ownerAddress = await accounts[0].getAddress();
        userAddress = await accounts[1].getAddress();
        user2Address = await accounts[2].getAddress();
        treasuryAddress = await accounts[9].getAddress();

        // WETH

        WETHToken = (await ethers.getContractFactory(
            "WETHToken"
        )) as WETHToken__factory;
        wETHToken = await WETHToken.deploy();
        await wETHToken.deployed();

        wETHAddress = wETHToken.address;

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

        mintingFactoryAddress = nftMintingFactory.address;

        // Exchange Core

        ExchangeCore = (await ethers.getContractFactory(
            "ExchangeCore"
        )) as ExchangeCore__factory;
        exchangeCore = await ExchangeCore.deploy(
            mintingFactoryAddress,
            aRegistryAddress,
            treasuryAddress
        );
        await exchangeCore.deployed();

        exchangeCoreAddress = exchangeCore.address;

        const addExchangeAddress = await nftMintingFactory
            .connect(owner)
            .updateExchangeAddress(exchangeCoreAddress);
        await addExchangeAddress.wait();
    });

    it("Should check owner", async () => {
        const tx1 = await exchangeCore.owner();
        assert.equal(tx1, ownerAddress);
    });

    it("Should set constructor correctly", async () => {
        const tx1 = await exchangeCore.adminRegistry();
        const tx2 = await exchangeCore.treasury();

        assert.equal(tx1, aRegistryAddress);
        assert.equal(tx2, treasuryAddress);
    });

    //cannot test variables that visibility is internal

    // cannot test function that visibility is internal
    // it("Should return true for validate Seller", async () => {});

    // cannot test function that visibility is internal
    // it("Should return true for validate Buyer", async () => {});

    it("Only Admin can call fixed Price Primary Sale", async () => {
        const name: string = "Monday";
        const symbol: string = "MON";
        const baseURI: string = "ipfs://";
        const nftId: string = "0x00";

        const tx1 = await nftMintingFactory
            .connect(owner)
            .createNFTCollection(name, symbol, baseURI);
        const tx1Receipt = await tx1.wait();

        const NFTCollection = tx1Receipt.events![1].args!.nftCollection;

        const nftPrice: BigNumber = ethers.utils.parseUnits("1.0");
        const approvedAmt: BigNumber = ethers.utils.parseUnits("2.0");

        const tokenId: number = 21;
        const buyer = userAddress;

        const transfer = await wETHToken
            .connect(owner)
            .transfer(userAddress, approvedAmt);
        await transfer.wait();

        const approve = await wETHToken
            .connect(user)
            .approve(exchangeCoreAddress, approvedAmt);
        await approve.wait();

        console.log(await wETHToken.balanceOf(userAddress));
        console.log(
            await wETHToken.allowance(userAddress, exchangeCoreAddress)
        );

        //'Only Exchange can call this!' error

        const tx2 = await exchangeCore
            .connect(owner)
            .fixedPricePrimarySale(
                NFTCollection,
                nftPrice,
                tokenId,
                nftId,
                buyer,
                wETHAddress
            );
        const tx2Receipt = await tx2.wait();
        const adminAddress = ownerAddress;

        expect(adminAddress).to.equal(tx2Receipt.from);
    });

    // cannot test function that visibility is internal
    // it("Should mint And Transfer", async () => {});

    it("Only Admin can call auctionPrimarySale", async () => {
        const name: string = "Monday";
        const symbol: string = "MON";
        const baseURI: string = "ipfs://";
        const nftId: string = "0x00";
        const msg: string = "msg";
        const sign: any = 0x993dab3dd91f5c6dc28e17439be475478f5635c92a56e17e82349d3fb2f166196f466c0b4e0c146f285204f0dcb13e5ae67bc33f4b888ec32dfe0a063e8f3f781b;

        const tx1 = await nftMintingFactory
            .connect(owner)
            .createNFTCollection(name, symbol, baseURI);
        const tx1Receipt = await tx1.wait();

        const NFTCollection = tx1Receipt.events![1].args!.nftCollection;

        const nftPrice: BigNumber = ethers.utils.parseUnits("1.0");
        const approvedAmt: BigNumber = ethers.utils.parseUnits("2.0");

        const tokenId: number = 21;
        const buyer = userAddress;

        const transfer = await wETHToken
            .connect(owner)
            .transfer(userAddress, approvedAmt);
        await transfer.wait();

        const approve = await wETHToken
            .connect(user)
            .approve(exchangeCoreAddress, approvedAmt);
        await approve.wait();

        console.log(await wETHToken.balanceOf(userAddress));
        console.log(
            await wETHToken.allowance(userAddress, exchangeCoreAddress)
        );

        const tx2 = await exchangeCore
            .connect(owner)
            .auctionPrimarySale(
                NFTCollection,
                nftPrice,
                tokenId,
                nftId,
                buyer,
                wETHAddress,
                msg,
                sign
            );

        const tx2Receipt = await tx2.wait();
        console.log(tx2Receipt);
    });
});
