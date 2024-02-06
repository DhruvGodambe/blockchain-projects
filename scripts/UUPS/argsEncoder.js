
const Book = require("../NFTMarketplace/Addresses.json");
const adminRegistryAddress = Book.ADMIN_REGISTRY_ADDRESS;

const main = async () => {

    const constructorABI = [{
        "inputs": [
          {
            "internalType": "address",
            "name": "_logic",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "_data",
            "type": "bytes"
          }
        ],
        "stateMutability": "payable",
        "type": "constructor"
      }];

    const implementation = "0xC7E5E0EE62A1DD3639EA82780C77bBaDc3b44E19"
    const encodedArgs = "0xfe4b84df000000000000000000000000000000000000000009b18ab5df7180b6b8000000"

    const args = [implementation, encodedArgs];

    let interface= new ethers.utils.Interface(constructorABI);
    const encodedData = interface.encodeFunctionData("constructor", args);
    console.log("encodedData : ", encodedData);



}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });