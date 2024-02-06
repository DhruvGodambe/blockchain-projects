const { ethers, upgrades} = require("hardhat");
const hre = require("hardhat");

const ProxyJSON = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactoryProxy.sol/MintingFactoryProxy.json');
const MintingFactoryabi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactory.sol/MintingFactory.json');
const MintingFactoryV2abi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactoryV2.sol/MintingFactoryV2.json');
const MintingFactoryV3abi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactoryV3.sol/MintingFactoryV3.json');
const Book = require("../NFTMarketplace/Addresses.json");

const adminRegistryAddress = Book.ADMIN_REGISTRY_ADDRESS;
let PROXY_ADDRESS;
let LOGIC_V2_ADDRESS;
let LOGIC_V3_ADDRESS;

const deployProxy = async (LOGIC_V1_ADDRESS) => {

      const constructorABI = [{
        "inputs": [
          {
            "internalType": "address",
            "name": "_adminRegistry",
            "type": "address"
          }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }];

    const args = [adminRegistryAddress]

    let interface= new ethers.utils.Interface(constructorABI);
    const encodedData = interface.encodeFunctionData("initialize", args);
    console.log("encodedData : ", encodedData);

    const mintingFactoryProxy = await hre.ethers.getContractFactory("MintingFactoryProxy");
    console.log("Deploying Minting FactoryProxy...");
    const proxy = await mintingFactoryProxy.deploy
    (
      LOGIC_V1_ADDRESS, // implementation V1 contract
      encodedData // bytes memory data
    );

    await proxy.deployed();
    // console.log("minting Factory Proxy : ", proxy);
    PROXY_ADDRESS = proxy.address;
    console.log("Minting Factory Proxy address: ", proxy.address);

}


const deploylogicV2 = async () => {

    const minitingFactory = await hre.ethers.getContractFactory("MintingFactoryV2");
    console.log("Deploying ExchangeCoreV2...");

    const MinitingFactoryV2 = await minitingFactory.deploy();
    await MinitingFactoryV2.deployed();
    // console.log("Miniting FactoryV2 V2: ", MinitingFactoryV2);

    LOGIC_V2_ADDRESS = MinitingFactoryV2.address;
    console.log("Miniting Factory V2 Contract deployed to: ", LOGIC_V2_ADDRESS);

}


const upgradeToV2 = async (proxyContract, LogicV2) => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const proxy = new ethers.Contract(proxyContract, ProxyJSON.abi, provider);

  const V1proxy = new ethers.Contract(proxyContract, MintingFactoryabi.abi, provider);

    console.log("Getting Current Implementation address");
  const CurrentImplementation  = await proxy.getImplementation();
    console.log("Current Implementation address : ", CurrentImplementation);


  const UpgradeImplementation  = await V1proxy.connect(admin).upgradeTo(LogicV2);
  await UpgradeImplementation.wait(1);
    console.log("Congratulations! Implementation successfully upgraded");

    console.log("Getting Upgraded Implementation address");
  const UpgradedImplementation  = await proxy.getImplementation();
    console.log("Upgraded Implementation address : ", UpgradedImplementation);

}


const initializeV2 = async (proxyContract) => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const LogicV2atProxy = new ethers.Contract(proxyContract, MintingFactoryV2abi.abi, provider);
    console.log("proxyContract address : ", proxyContract);

    const adminRegistry_Address  = await LogicV2atProxy.adminRegistry();
    console.log("adminRegistry_Address : ", adminRegistry_Address);

    const ID  = await LogicV2atProxy.ID();
    console.log("ID before initializing : ", ID);


    const proxy = new ethers.Contract(proxyContract, ProxyJSON.abi, provider);
    const CurrentImplementation  = await proxy.getImplementation();
    console.log("Upgraded Implementation address : ", CurrentImplementation);
    
    const V2initializing  = await LogicV2atProxy.connect(admin).initialize();
    await V2initializing.wait(1);
    console.log("Initialized V2 : ", V2initializing);

    const ID2  = await LogicV2atProxy.ID();
    console.log("ID after initializing : ", ID2);
    
    console.log("Congratulations! Implementation V2 successfully initialized");

    const setId = await LogicV2atProxy.connect(admin).setID("Hey there! I am set at LogicV2");
    await setId.wait();

}


const deploylogicV3 = async () => {

  const mintingFactoryV3 = await hre.ethers.getContractFactory("MintingFactoryV3");
  console.log("Deploying Minting Factory V3...");

  const MintingFactoryV3 = await mintingFactoryV3.deploy();
  await MintingFactoryV3.deployed();

  LOGIC_V3_ADDRESS = MintingFactoryV3.address;
  console.log("MintingFactoryV3 Contract deployed to: ", LOGIC_V3_ADDRESS);

}


const upgradeToV3 = async (proxyContract, LogicV3) => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const proxy = new ethers.Contract(proxyContract, ProxyJSON.abi, provider);

  const V2proxy = new ethers.Contract(proxyContract, MintingFactoryV3abi.abi, provider);

    console.log("Getting Current Implementation address");
  const CurrentImplementation  = await proxy.getImplementation();
    console.log("Current Implementation address : ", CurrentImplementation);


  const UpgradeImplementation  = await V2proxy.connect(admin).upgradeTo(LogicV3);
  await UpgradeImplementation.wait(1);
    console.log("Congratulations! Implementation successfully upgraded");

    console.log("Getting Upgraded Implementation address");
  const UpgradedImplementation  = await proxy.getImplementation();
    console.log("Upgraded Implementation address : ", UpgradedImplementation);

}


const initializeV3 = async (proxyContract) => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const LogicV3atProxy = new ethers.Contract(proxyContract, MintingFactoryV3abi.abi, provider);
    console.log("proxyContract address : ", proxyContract);

  const adminRegistry_Address  = await LogicV3atProxy.adminRegistry();
    console.log("adminRegistry_Address : ", adminRegistry_Address);
  const ID  = await LogicV3atProxy.ID();
    console.log("ID : ", ID);


    const proxy = new ethers.Contract(proxyContract, ProxyJSON.abi, provider);
    const CurrentImplementation  = await proxy.getImplementation();
    console.log("Upgraded Implementation address : ", CurrentImplementation);

    const _IamV3  = await LogicV3atProxy.IamV3();
    console.log("IamV3 before initializing : ", _IamV3);
    
    const V3initializing  = await LogicV3atProxy.connect(admin).initialize();
    await V3initializing.wait(1);
    console.log("Initialized V3");

    const IamV3  = await LogicV3atProxy.IamV3();
    console.log("IamV3 after initializing : ", IamV3);
    
    console.log("Congratulations! Implementation V2 successfully initialized");

}

const main = async () => {

    LogicV1 = "0x54303f9d265880eeE8ac470a09AEFeeeE26102f4";

    await deployProxy(
      LogicV1 //LogicV1 address
      );

    await deploylogicV2();

    await upgradeToV2
    (
      PROXY_ADDRESS, // Proxy contract address
      LOGIC_V2_ADDRESS // Logic V2 address (Upgraded Logic)
    );

    await initializeV2(
      PROXY_ADDRESS
    );

    await deploylogicV3();

    await upgradeToV3
    (
      PROXY_ADDRESS, // Proxy contract address
      LOGIC_V3_ADDRESS // Logic V2 address (Upgraded Logic)
    );

    await initializeV3(
      PROXY_ADDRESS
    );

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });