const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
const { wethAbi } = require("../../artifacts/contracts/NFTMarketplace/Exchange/Interface/IERC20.sol/IERC20.json");
const { nftAbi } = require("../../artifacts/contracts/NFTMarketplace/Exchange/Interface/IERC721.sol/IERC721.json")


let account, account2, WETH, NFT, exchangeContractInstance;

describe("ExchangeCore", () => {
    // All deployments should go in scripts
    let wethAddress = '0xDf032Bc4B9dC2782Bb09352007D4C57B75160B15';
    let nftAddress = '0x920364dBa7540fea7d3e9c8e27e94eF1CA5B317e';
    let amount = 1;
    let tokenId = 1;
    let exchangeAddress;


    beforeEach(async () => {
        [account, account2] = await ethers.getSigners();

    })

    it('Should load WETH contract', async () => {
        WETH = new ethers.Contract(wethAddress, wethAbi.abi, account);
        console.log(WETH);
    })

    it('Should load NFT contract', async () => {
        NFT = new ethers.Contract(nftAddress, nftAbi.abi, account)
        console.log(NFT);
    })

    it('Should deploy Exchange contract', async () => {
        let exchangeContract = await ethers.getContractFactory("ExchangeCore");
        exchangeContract.deploy();
        exchangeContractInstance = await exchangeContract.deployed();
    })

    it('Should Approve x tokens for Buy Order', async () => {
        // approves amount tokens
        let allowanceAmt = await WETH.allowance(account, exchangeAddress);
        console.log(allowanceAmt);

    })

    it('Should Approve nft with given tokenId for Sell Order', async () => {
        // approves the nft with given token id
        let allowanceNFT = await NFT.getApproved(tokenId);
        console.log(allowanceNFT);

    })

    it('Should Validate the NFT sale', async () => {
        // check token allowance
        let allowanceAmt = await WETH.allowance(account, exchangeAddress);
        console.log(allowanceAmt);

        // check if user has x amt of token balance
        let userBalance = await WETH.balanceOf(account);

        // check nft allowance
        let allowanceNFT = await NFT.getApproved(tokenId);
        console.log(allowanceNFT);

        // check auction time

    })

    it('Should execute the order', async () => {
        let executeOrder = await exchangeContractInstance.executeOrder(nftAddress, tokenId, account, account2, amount, auctionTime);
        console.log(executeOrder);
    })

    it('Should cancel the order', async () => {
        let cancelOrder = await exchangeContractInstance.cancelOrder(nftAddress, tokenId, account);
        console.log(cancelOrder);
    })


})
