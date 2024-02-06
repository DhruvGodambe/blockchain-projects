const { ethers, upgrades} = require("hardhat");
const hre = require("hardhat");

const ExchangeProxyabi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCoreProxy.sol/ExchangeCoreProxy.json');
const ExchangeCoreabi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCore.sol/ExchangeCore.json');
const Book = require("../NFTMarketplace/Addresses.json");
const MintingFactoryProxyabi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactoryProxy.sol/MintingFactoryProxy.json');
const MintingFactoryabi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactory.sol/MintingFactory.json');
const enochTokenabi = require('../../artifacts/contracts/Tokens/Enoch.sol/Enoch.json');

const enochTokenAddress = Book.ENOCHTOKEN_ADDRESS;
const adminAddress = Book.ADMIN_ADDRESS;
const adminRegistryAddress = Book.ADMIN_REGISTRY_ADDRESS;
const treasuryAddress = Book.TREASURY_ADDRESS;
NFT_COLLECTION = "0x1669cBB15538A4B9dfE659A1601EEB9f24Cd0Cc9";
let Exchange_V1_ADDRESS;
let exchange1967PROXY;
let EXCHANGE_V1_Proxy;
let MintingFactory_V1_ADDRESS;
let mintingFactory1967PROXY;
let MINTINGfACTORY_V1Proxy;


const deployMintingFactoryV1 = async () => {

    const mintingFactory = await hre.ethers.getContractFactory("MintingFactory");
    console.log("Deploying MintingFactory...");
    const MintingFactoryV1 = await mintingFactory.deploy();
    await MintingFactoryV1.deployed();
    console.log("MintingFactoryV1 deployed");
    console.log("MintingFactoryV1 Contract deployed to: ", MintingFactoryV1.address);
    MintingFactory_V1_ADDRESS = MintingFactoryV1.address;

}

const deployMintingFactoryProxy = async () => {

  const encodedData = "0xc4d66de800000000000000000000000069d260289d8422496f0bd50a17d6ed6b98f1851e";

  const mintingFactoryProxy = await hre.ethers.getContractFactory("MintingFactoryProxy");
  console.log("Deploying Minting Factory Proxy...");
  const proxy = await mintingFactoryProxy.deploy
  (
    MintingFactory_V1_ADDRESS,
    encodedData 
  );

  await proxy.deployed();
  mintingFactory1967PROXY = proxy.address;
  console.log("Minting Factory 1967 PROXY address: ", mintingFactory1967PROXY);

}

const MintingFactoryLogicV1Proxy = async () => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const proxy = new ethers.Contract(mintingFactory1967PROXY, MintingFactoryabi.abi, provider);
  MINTINGfACTORY_V1Proxy = proxy.address;

}


const deployExchangeCoreV1 = async () => {

    const exchangeCore = await hre.ethers.getContractFactory("ExchangeCore");
    console.log("Deploying ExchangeCore...");
    const ExchangeCoreV1 = await exchangeCore.deploy();
    await ExchangeCoreV1.deployed();
    console.log("ExchangeCore deployed");
    console.log("ExchangeCoreV1 Contract deployed to: ", ExchangeCoreV1.address);
    Exchange_V1_ADDRESS = ExchangeCoreV1.address;

}

const deployExchangeCoreProxy = async () => {

    const constructorABI = [{
		"inputs": [
		  {
			"internalType": "contract IMintingFactory",
			"name": "_mintingFactory",
			"type": "address"
		  },
		  {
			"internalType": "address",
			"name": "_adminRegistry",
			"type": "address"
		  },
		  {
			"internalType": "address",
			"name": "_treasury",
			"type": "address"
		  }
		],
		"name": "initialize",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	  }];

    const args = [MINTINGfACTORY_V1Proxy, 
        adminRegistryAddress,
        treasuryAddress
    ]

    let interface= new ethers.utils.Interface(constructorABI);
    const encodedData = interface.encodeFunctionData("initialize", args);
    console.log("encodedData : ", encodedData);

  const exchangeCoreProxy = await hre.ethers.getContractFactory("ExchangeCoreProxy");
  console.log("Deploying ExchangeCore Proxy...");
  const proxy = await exchangeCoreProxy.deploy
  (
    Exchange_V1_ADDRESS,
    encodedData 
  );

  await proxy.deployed();
  exchange1967PROXY = proxy.address;
  console.log("Exchange Core 1967 PROXY address: ", exchange1967PROXY);

}

const ExchangeLogicV1Proxy = async () => {

    const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const proxy = new ethers.Contract(exchange1967PROXY, ExchangeCoreabi.abi, provider);
  EXCHANGE_V1_Proxy = proxy.address;

}

const SettingExchangeinMintingFactorylogicV1Proxy = async () => {

    const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const proxy = new ethers.Contract(mintingFactory1967PROXY, MintingFactoryabi.abi, provider);
  MINTINGfACTORY_V1Proxy = proxy.address;

    console.log("Setting Exchange Proxy Address in Minting Factory");

    let tx1 = await proxy.connect(admin).updateExchangeAddress(EXCHANGE_V1_Proxy);

    const receipt1 = await tx1.wait();
    let event = receipt1.events?.find((event) => event.event === "ExchangeAddressChanged");
    console.log("Updated Exchange Address is : ", event?.args.newExchange);

}



const main = async () => {
    await deployMintingFactoryV1();
    await deployMintingFactoryProxy();
    await MintingFactoryLogicV1Proxy();
    await deployExchangeCoreV1();
    await deployExchangeCoreProxy();
    await ExchangeLogicV1Proxy();
    await SettingExchangeinMintingFactorylogicV1Proxy();
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });