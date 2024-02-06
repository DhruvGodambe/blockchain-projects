const { ethers, upgrades} = require("hardhat");
const hre = require("hardhat");

const Collectionabi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/Collection/Collection.sol/Collection.json')
const ExchangeProxyabi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCoreProxy.sol/ExchangeCoreProxy.json');
const ExchangeCoreabi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCore.sol/ExchangeCore.json');
const Book = require("../NFTMarketplace/Addresses.json");
const MintingFactoryProxyabi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactoryProxy.sol/MintingFactoryProxy.json');
const MintingFactoryabi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactory.sol/MintingFactory.json');
const enochTokenabi = require('../../artifacts/contracts/Tokens/Enoch.sol/Enoch.json');

const enochTokenAddress = Book.ENOCHTOKEN_ADDRESS;
const adminAddress = Book.ADMIN_ADDRESS;
NFT_COLLECTION = "0x1669cBB15538A4B9dfE659A1601EEB9f24Cd0Cc9";
const tokenId = 5;
const nftId = "evening/day1";
const nftPrice = "550";
let Exchange_V1_ADDRESS = "0xd37A44AC996120e48e133A08e8A34f1E018E5544";
let exchange1967PROXY = "0x0B289a1FC10E312261302D29692257E1F75253E3";
let EXCHANGE_V1_Proxy = "";
let MintingFactory_V1_ADDRESS = "0x9dAc468EEA3b797350203716EA852B42975FF318";
let mintingFactory1967PROXY = "0x0BF376fd9Bd9fF46a9287252512671dd1667195F";
let MINTINGfACTORY_V1_Proxy = "";
let Collection_ADDRESS;


const ExchangeLogicV1Proxy = async () => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const proxy = new ethers.Contract(exchange1967PROXY, ExchangeCoreabi.abi, provider);
  EXCHANGE_V1_Proxy = proxy.address;
  console.log("EXCHANGE_V1_Proxy address is : ", EXCHANGE_V1_Proxy);

}


const MintingFactoryLogicV1Proxy = async () => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");
  
  const proxy = new ethers.Contract(mintingFactory1967PROXY, MintingFactoryabi.abi, provider);
  MINTINGfACTORY_V1_Proxy = proxy.address;
  console.log("MINTINGfACTORY_V1_Proxy address is : ", MINTINGfACTORY_V1_Proxy);

  console.log("Exchange Proxy Address in Minting Factory already set in deployment script");

  const tx2 = await proxy.exchangeAddress();
  console.log("exchangeAddress set in minting factory is :", tx2);

  const tx3 = await proxy.connect(admin).createNFTCollection("ENOCHcollection", "ENOCH", "ipfs/io");

  const receipt3 = await tx3.wait();

  let event3 = receipt3.events?.find((event) => event.event === "NFTCollectionCreated");
  console.log("Name of Collection is : ", event3?.args.name);
  console.log("Symbol of Collection is : ", event3?.args.symbol);
  console.log("Collection is : ", event3?.args.nftCollection);


  Collection_ADDRESS = event3?.args.nftCollection;
  const CollectionInstance = new ethers.Contract(Collection_ADDRESS, Collectionabi.abi, provider);
  const tx11 = await CollectionInstance.mintingFactory();
  console.log("mintingfactory address set in collection is :", tx11);
}

const ApproveBuyerToken = async () => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

  const EnochToken = new ethers.Contract(enochTokenAddress, enochTokenabi.abi, provider);

  const tx6 = await EnochToken.connect(admin).approve(EXCHANGE_V1_Proxy, "5550000000000000000000000000");
  await tx6.wait();

    console.log("Checking allowance");
  const tx7 = await EnochToken.connect(admin).allowance(adminAddress, EXCHANGE_V1_Proxy);
    console.log("Allowance tx7 :", tx7);
}


const FixedPricePrimarySale = async () => {

  const accounts = await ethers.getSigners();
  const admin  = accounts[0];
  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");

    console.log("*@. Fixed Price Primary Sale from ExchangeCore contract*");

  const ExchangeV1proxy = new ethers.Contract(exchange1967PROXY, ExchangeCoreabi.abi, provider);
  // console.log("ExchangeV1proxy : ", ExchangeV1proxy);
    
  try{
      const tx5 = await ExchangeV1proxy.connect(admin).fixedPricePrimarySale(NFT_COLLECTION,
      nftPrice, 
      tokenId,
      nftId,
      adminAddress,
      enochTokenAddress
    );

    const receipt5 = await tx5.wait();
    } catch(error){
        console.log("error : ", error)
    }
    // console.log("Fixed Price Primary sale for ", NFT_COLLECTION, " is executed");

    // let event5 = receipt5.events?.find((event) => event.event === "FixedPricePrimarySale");
    // console.log(event5);

    // console.log("Token URL for the corresponding token Id is  : ", event5?.args._tokenURL);
}


const main = async () => {
    await ExchangeLogicV1Proxy();
    await MintingFactoryLogicV1Proxy();
    await ApproveBuyerToken();
    await FixedPricePrimarySale();
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });