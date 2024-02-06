const abi = require('../artifacts/contracts/NFTMarketplace/MintingAndStorage/ERC721NFTContract.sol/ERC721NFTContract.json');

const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");


let account, account2, erc721MintingFactoryInstance, nftContract, nftContractInstance;
let mintingFactoryAddress, newExchangeAddress;

// creating an instance of the minting factory
factoryContractInstance = async () => {
    const erc721MintingFactory = await ethers.getContractFactory("AltERC721MintingFactory");
    erc721MintingFactoryInstance = await erc721MintingFactory.deploy();
    await erc721MintingFactoryInstance.deployed();
    console.log("Deployed!!!");

    mintingFactoryAddress = erc721MintingFactoryInstance.address;
    console.log("Minting Factory Address: ", mintingFactoryAddress);
}


describe("ERC721MintingFactory", () => {


    // calling the minting factory function to create its instance
    factoryContractInstance();


    beforeEach(async () => {
        [account, account2] = await ethers.getSigners();

    })



    // WORKING
    it('Should mint NFT contract', async () => {
        // mint NFT contract
        let nftContractAddress = await erc721MintingFactoryInstance.createNFTContract("Royal Challengers Bangalore", "RCB");

        await nftContractAddress.wait();

        // let nftContract;
        // console.log("Sender:", nftContractAddress.from);

        // listen contract creation event
        erc721MintingFactoryInstance.on("NFTContractCreated", (_name, _symbol, _nftContract) => {
            nftContract = _nftContract;
            console.log(_name, _symbol, _nftContract);
        });
        await new Promise(res => setTimeout(() => res(null), 5000));

        // take nft instance
        nftContractInstance = new ethers.Contract(nftContract, abi.abi, account);
        console.log("Contract Address: ", nftContract);
        // console.log(nftContractInstance);
        // expect(await nftContract).to.equal(nftContractAddress);
    })

    // it ('Should return NFT contract created by the user', async () => {
    //     nftContractInstance = new ethers.Contract(nftContract, abi.abi, account);
    //     console.log(nftContract);
    //     console.log(erc721MintingFactoryInstance.getNFTsForOwner(account));

    // })

    it('Should mint an NFT for a contract', async () => {
        let newNFT = await erc721MintingFactoryInstance.connect(account).mintNFT(nftContract, "https://gateway.pinata.cloud/ipfs/QmYJ8A4js3Pcqgp3HkCeoj2BUuen5tD7o8Z4R2k46eLM8b");

        await newNFT.wait()

        // this shows error as it would be called by the creator only 
        let tokenIdMinted;
        erc721MintingFactoryInstance.on("NFTMinted", (_nftContract, _tokenId) => {
            tokenIdMinted = _tokenId;
            console.log(_nftContract, _tokenId);
        });
        await new Promise(res => setTimeout(() => res(null), 5000));
        console.log("TokenID Minted #: ", tokenIdMinted);
    })

    // WORKING FINE
    it('Should return totalNFTs minted for a contract', async () => {
        let totalNFTs = await erc721MintingFactoryInstance.getTotalNFTsMinted(nftContract);

        console.log(totalNFTs);
    })

    // WORKING => But gives undefined
    it('Should return total NFT contract minted by a user', async () => {
        // let totalCollections = await erc721MintingFactoryInstance.getNFTsForOwner(account);
        let totalCollections = await erc721MintingFactoryInstance.ownerToNFTs[account];

        // await totalCollections.wait();

        console.log("total collections: ", totalCollections);
    })

    // WORKING FINE
    it('Should be able to change Exchange Address', async () => {
        let changeAddress = await erc721MintingFactoryInstance.updateExchangeAddress(account2.address);
        await changeAddress.wait();



        erc721MintingFactoryInstance.on("ExchangeAddressChanged", (_oldAddress, _newAddress) => {
            newExchangeAddress = _newAddress;
            console.log(_oldAddress, _newAddress);
        });
        await new Promise(res => setTimeout(() => res(null), 5000));
        console.log("New Exchange Address: ", newExchangeAddress);
    })


    // ERROR => Only Exchange can call it, Done that
    it('Should be able to change NFT owner in mapping', async () => {
        let nftOwnerChange = await erc721MintingFactoryInstance.connect(account2).updateOwner(nftContract, 1, '0x259989150c6302D5A7AeEc4DA49ABfe1464C58fE');
        await nftOwnerChange.wait();

        let newOwner, tokenId;
        erc721MintingFactoryInstance.on("OwnerUpdated", (_nftContract, _tokenId, _newOwner) => {
            newOwner = _newOwner;
            tokenId = _tokenId;
            console.log(_nftContract, _tokenId, _newOwner);
        });
        await new Promise(res => setTimeout(() => res(null), 5000));
        console.log("New Owner Address: ", newOwner, " Token Id: ", tokenId, " old owner: ", account2.address);

    })



})
