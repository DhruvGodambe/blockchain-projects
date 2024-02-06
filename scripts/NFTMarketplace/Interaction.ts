import { Address } from "cluster";
import { keccak256 } from "ethers/lib/utils";

const { ethers} = require("hardhat");


const fs = require('fs');
const { writeFileSync } = require("fs");
const path = require('path');
const Book = require("../NFTMarketplace/Addresses.json");

const AdminRegistryabi = require('../../artifacts/contracts/Registry/AdminRegistry.sol/AdminRegistry.json');
const mintingFactoryabi = require('../../artifacts/contracts/NFTMarketplace/MintingAndStorage/MintingFactory/MintingFactory.sol/MintingFactory.json');
const exchangeCoreabi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCore.sol/ExchangeCore.json');
const enochTokenabi = require('../../artifacts/contracts/Tokens/Enoch.sol/Enoch.json');


const adminAddress = Book.ADMIN_ADDRESS;
const adminRegistryAddress = Book.ADMIN_REGISTRY_ADDRESS;
const treasuryAddress = Book.TREASURY_ADDRESS;
const mintingFactoryAddress = Book.MINTING_FACTORY_ADDRESS;
const exchangeCoreAddress = Book.EXCHANGE_CORE_ADDRESS;
const enochTokenAddress = Book.ENOCHTOKEN_ADDRESS;

// const PrivateKey = process.env.PRIVATE_KEY_LOCALHOST_1;
// const providerURL = process.env.PROVIDER_URL;

const tokenId = 5;
const nftId = "evening/day1";
const nftPrice = "550";
const _message = {"nonce":326843,"timestamp":"1671607403144","message":"I am signing in at 2022-12-21T07:23:23.144Z"};
const _stringMessage =  JSON.stringify(_message);
const _signature = "0x6e6af43443ea1324faa048a4a64d98d38b96ab33d876c97c55fd59302b47f68217ea7a335e452b306f4080cf01cf0dd0683dd86a845bc23586601d8e3acaf4841c";

/*
marketplaceInteraction.ts requirements:
1. createCollection
2. mintNFT
3. fixedPricePrimarySale
4. auctionPrimarySale
*/
/*
const bytes32FromMessage = (message:string) => {
  let hexMessage = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message));
  // let hexMessage = keccak256(message);
  let bytes32Message = ethers.utils.formatBytes32String(hexMessage,32);
  console.log("message:",message);
  console.log("hexMessage:",hexMessage);
  // console.log("bytes32FromMessage:",bytes32Message);
  return hexMessage;
}
const toBytes = (signature:string) => Array.from(Buffer.from(signature, 'utf8'));
*/


const main = async () => {

  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");
  console.log(" PROVIDER : ", provider);

  const admin = new ethers.Wallet( "0x1d6817ca1509086f55f2f4751cf8464f305dd6ba713778d31ade993bd7b984bb" , provider );
  console.log(" Admin ADDRESS : ", admin.address);

    const accounts = await ethers.getSigners();
    const treasury = "0x404DbBbD516d101b41Ce1671C9e5D0766272d047";
    console.log("Inside main function ========>");
    

    const AdminRegistry = new ethers.Contract(adminRegistryAddress, AdminRegistryabi.abi, provider);
    console.log("AdminRegistry",AdminRegistry);
  
    const tx1 = await AdminRegistry.isAdmin(adminAddress);
    console.log(adminAddress, " is the admin of Admin Registry? ", tx1);
    

    console.log("<<<<=====================================================>>>>");

    const MintingFactory = new ethers.Contract(mintingFactoryAddress, mintingFactoryabi.abi, provider);
    console.log("MintingFactory : ",MintingFactory);

    //@ 1. Create NFT Collection
    console.log("@ 1. Creating NFT Collection");

    const tx2 = await MintingFactory.connect(admin).createNFTCollection("KingJames", "KJ", "https://ipfs.io/ipfs/ENOCH/");

    const receipt2 = await tx2.wait();

    let event2 = receipt2.events?.find((event:any) => event.event === "NFTCollectionCreated");
    console.log(event2);
    

    console.log("Name of Collection is : ", event2?.args.name);
    console.log("Symbol of Collection is : ", event2?.args.symbol);
    console.log("Collection is : ", event2?.args.nftCollection);
    
    console.log("<<<<=====================================================>>>>");

    console.log("Saving the data of Create Collection in a json file");

    let NFT_NAME = event2?.args.name;
    let NFT_SYMBOL = event2?.args.symbol;
    let NFT_COLLECTION = event2?.args.nftCollection;
            
            
            console.log("Writing a new file to store Marketplace address...");
            
            await writeFileSync(
              path.join(__dirname, 'Collection.json'),
              JSON.stringify(
                {
                  NFT_NAME,
                  NFT_SYMBOL,
                  NFT_COLLECTION
                },
                null,
                2
                )
                );
                
            console.log("<=====  Written NFT Collection data in nftCollection.json  =====>");



    console.log("<<<<=====================================================>>>>");

    const ExchangeCore = new ethers.Contract(exchangeCoreAddress, exchangeCoreabi.abi, provider);
    console.log("ExchangeCore : ",ExchangeCore);


    console.log("<<<<===============================================================>>>>");

    const EnochToken = new ethers.Contract(enochTokenAddress, enochTokenabi.abi, provider);
    console.log("Enoch Token : ", EnochToken);

    //@ Approving buyer token to exchange core by admin

    const tx6 = await EnochToken.connect(admin).approve(exchangeCoreAddress, "5550000000000000000000000000");
    const receipt6 = await tx6.wait();
    console.log("Approve receipt6 :", receipt6);

    console.log("Checking allowance");
    

    const tx7 = await EnochToken.connect(admin).allowance(adminAddress, exchangeCoreAddress);
    console.log("Allowance tx7 :", tx7);



    console.log("<<<<===============================================================>>>>");

/*    //@ 5. FIXED PRICE Primary Sale
    console.log("@ 5. Fixed Price Primary Sale from ExchangeCore contract");
    const tx5 = await ExchangeCore.connect(admin).fixedPricePrimarySale(NFT_COLLECTION,
      nftPrice, 
      tokenId,
      nftId,
      adminAddress,
      enochTokenAddress
    );
    const receipt5 = await tx5.wait();
    console.log("Primary sale for ", NFT_COLLECTION, " : ", receipt5);
    let event5 = receipt5.events?.find((event:any) => event.event === "FixedPricePrimarySale");
    console.log(event5);
    console.log("Token URL for the corresponding token Id is  : ", event5?.args._tokenURL);
*/    
    console.log("<<<<===============================================================>>>>");   

    //@ 5. AUCTION Primary Market
    console.log("@ 5. Auction Primary Market from ExchangeCore contract");

    const tx20 = await ExchangeCore.connect(admin).auctionPrimarySale(NFT_COLLECTION,
      nftPrice, 
      tokenId,
      nftId,
      adminAddress,
      enochTokenAddress,
      _stringMessage,
      _signature
    );
      console.log("Auction completed");
      
    const receipt20 = await tx20.wait();
    console.log("Auction Primary sale for ", NFT_COLLECTION, " : ", receipt20);
    let event20 = receipt20.events?.find((event:any) => event.event === "AuctionPrimarySaleExecuted");
    console.log(event20);

    console.log("Token URL for the corresponding token Id is  : ", event20?.args._tokenURL);

    console.log("<<<<===============================================================>>>>");
/*
    const Collection = new ethers.Contract(NFT_COLLECTION, NFTCollectionabi.abi, provider);
    console.log("Nft Collection instance : ",Collection);
    const tx8 = await Collection.tokenURI(tokenId);
    console.log("Token URI", tx8);
*/
    

  /*  console.log("<<<<===============================================================>>>>");
    //@ 4. MintNFT
    console.log("@ 4. Minting NFT from Minting Factory");
    const tx4 = await MintingFactory.connect(ExchangeCore).mintNFT(NFT_COLLECTION);
    const receipt4 = await tx4.wait();
    console.log("receipt4 :", receipt4);
    let event4 = receipt4.events?.find((event:any) => event.event === "NFTMinted");
    console.log("NFT  Minted from Minting Factory");
    
    */



};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });