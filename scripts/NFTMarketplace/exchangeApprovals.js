const { ethers } = require("hardhat");
// const hre = require("hardhat");

const tokenAbi = require('./WETHABI.json');
const nftAbi = require('../artifacts/contracts/NFTMarketplace/MintingAndStorage/AltERC721NFTContract.sol/AltERC721NFTContract.json');

async function main() {

    const AltERC721MintingFactory = await hre.ethers.getContractFactory("AltERC721MintingFactory");
    const AltERC721MintingFactoryInstance = await AltERC721MintingFactory.deploy();
    await AltERC721MintingFactoryInstance.deployed();

    const [account, account2] = await ethers.getSigners();

    let ercToken = '0xDf032Bc4B9dC2782Bb09352007D4C57B75160B15';
    let nftContract = '0x920364dBa7540fea7d3e9c8e27e94eF1CA5B317e';

    // ercTokenContract Instance
    const ercTokenContract = new ethers.Contract(ercToken, tokenAbi, account);
    console.log(ercTokenContract);

    // nftContract Instance
    const nftContractInstance = new ethers.Contract(nftContract, nftAbi.abi, account);
    console.log(nftContractInstance);

    // approve exchange for token
    const exchangeAddress = '0x259989150c6302D5A7AeEc4DA49ABfe1464C58fE';
    const amount = 1;
    const approveAmt = await ercTokenContract.approve(exchangeAddress, amount);

    // approve exchange for nft
    const tokenId = 1;
    const approveNFT = await nftContractInstance.approve(exchangeAddress, tokenId);

    console.log(approveAmt);
    console.log(approveNFT);

    // const gasPrice = parseInt(enoch.deployTransaction.gasPrice.toString())
    // const gasLimit = parseInt(enoch.deployTransaction.gasLimit.toString())
    // console.log("Gas price", gasPrice / 10 ** 9);
    // console.log("Gas Limit", gasLimit);
    // console.log("Ether required", (gasLimit * gasPrice) / 10 ** 18);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main();
