const { ethers} = require("hardhat");

const Book = require("../NFTMarketplace/Addresses.json");
const mintingFactoryAddress = Book.MINTING_FACTORY_ADDRESS;
const adminRegistryAddress = Book.ADMIN_REGISTRY_ADDRESS;
const treasuryAddress = Book.TREASURY_ADDRESS;

const main = async () => {

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



}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });