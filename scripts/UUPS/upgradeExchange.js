const { ethers, upgrades} = require("hardhat");
const hre = require("hardhat");

const ProxyJSON = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCoreProxy.sol/ExchangeCoreProxy.json');
const ExchangeCoreV2abi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCoreV2.sol/ExchangeCoreV2.json');
const ExchangeCoreabi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCore.sol/ExchangeCore.json');
const Book = require("../NFTMarketplace/Addresses.json");
const ExchangeCoreV3abi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCoreV3.sol/ExchangeCoreV3.json');

const mintingFactoryAddress = Book.MINTING_FACTORY_ADDRESS;
const adminRegistryAddress = Book.ADMIN_REGISTRY_ADDRESS;
const treasuryAddress = Book.TREASURY_ADDRESS;
let PROXY_ADDRESS;
let LOGIC_V2_ADDRESS;
let LOGIC_V3_ADDRESS;

const deployProxy = async (LOGIC_V1_ADDRESS) => {

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

    const args = [mintingFactoryAddress, 
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
      LOGIC_V1_ADDRESS, // implementation V1 contract
      encodedData // bytes memory data
    );

    await proxy.deployed();
    // console.log("Exchange Core PROXY : ", proxy);
    PROXY_ADDRESS = proxy.address;
    console.log("Exchange Core PROXY address: ", proxy.address);

}

const deploylogicV2 = async () => {

    const ExchangeCore = await hre.ethers.getContractFactory("ExchangeCoreV2");
    console.log("Deploying ExchangeCoreV2...");

    const ExchangeCoreV2 = await ExchangeCore.deploy();
    await ExchangeCoreV2.deployed();
    // console.log("Exchange Core V2: ", ExchangeCoreV2);

    LOGIC_V2_ADDRESS = ExchangeCoreV2.address;
    console.log("ExchangeCoreV2 Contract deployed to: ", LOGIC_V2_ADDRESS);

}

const upgradeToV2 = async (proxyContract, LogicV2) => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const proxy = new ethers.Contract(proxyContract, ProxyJSON.abi, provider);
    // console.log("Proxy : ", proxy);

  const V1proxy = new ethers.Contract(proxyContract, ExchangeCoreabi.abi, provider);
    // console.log("V1proxy : ", V1proxy);

    console.log("Getting Current Implementation address");
  const CurrentImplementation  = await proxy.getImplementation();
    console.log("Current Implementation address : ", CurrentImplementation);


  const UpgradeImplementation  = await V1proxy.connect(admin).upgradeTo(LogicV2);
    // console.log("Upgrade Implementation : ", UpgradeImplementation);
  await UpgradeImplementation.wait(1);
    console.log("Congratulations! Implementation successfully upgraded");

    console.log("Getting Upgraded Implementation address");
  const UpgradedImplementation  = await proxy.getImplementation();
    console.log("Upgraded Implementation address : ", UpgradedImplementation);

}

const initializeV2 = async (proxyContract) => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
    // console.log("admin", admin);

  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");
    // console.log(" PROVIDER : ", provider);

  const LogicV2atProxy = new ethers.Contract(proxyContract, ExchangeCoreV2abi.abi, provider);
    console.log("Logic V2 at Proxy : ", LogicV2atProxy);
    console.log("proxyContract address : ", proxyContract);

    const Treasury_Address  = await LogicV2atProxy.treasury();
    console.log("Treasury_Address : ", Treasury_Address);
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

  const exchangeCore = await hre.ethers.getContractFactory("ExchangeCoreV3");
  console.log("Deploying ExchangeCoreV3...");

  const ExchangeCoreV3 = await exchangeCore.deploy();
  await ExchangeCoreV3.deployed();

    // console.log("Exchange Core V2: ", ExchangeCoreV3);

  LOGIC_V3_ADDRESS = ExchangeCoreV3.address;
  console.log("ExchangeCoreV3 Contract deployed to: ", LOGIC_V3_ADDRESS);

}

const upgradeToV3 = async (proxyContract, LogicV3) => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const proxy = new ethers.Contract(proxyContract, ProxyJSON.abi, provider);
    // console.log("Proxy : ", proxy);

  const V2proxy = new ethers.Contract(proxyContract, ExchangeCoreV3abi.abi, provider);
    // console.log("V1proxy : ", V1proxy);

    console.log("Getting Current Implementation address");
  const CurrentImplementation  = await proxy.getImplementation();
    console.log("Current Implementation address : ", CurrentImplementation);


  const UpgradeImplementation  = await V2proxy.connect(admin).upgradeTo(LogicV3);
    // console.log("Upgrade Implementation : ", UpgradeImplementation);
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

  const LogicV3atProxy = new ethers.Contract(proxyContract, ExchangeCoreV3abi.abi, provider);
    console.log("proxyContract address : ", proxyContract);

    const Treasury_Address  = await LogicV3atProxy.treasury();
    console.log("Treasury_Address : ", Treasury_Address);
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

    LogicV1 = "0x187e90F7c5126a577Bd4383b05e232fD3b788490";

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