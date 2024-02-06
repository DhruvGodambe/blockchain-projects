const { ethers} = require("hardhat");

const Book = require("../NFTMarketplace/Addresses.json");
const adminRegistryAddress = Book.ADMIN_REGISTRY_ADDRESS;

const main = async () => {

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



}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });