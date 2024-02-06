const { ethers, upgrades} = require("hardhat");
const hre = require("hardhat");

const main = async () => {

    const constructorABI = [{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_initialSupply",
				"type": "uint256"
			}
		],
		"name": "initialize",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}];


	const decimals = 18;
	const LoveSupply = "1500000000"; // 1.5B
	const _initialSupply = ethers.utils.parseUnits(LoveSupply, decimals);
	const implementation = "0x16B175f81033DF71723BA677A28bf212d4ba66E2"

    const args = [_initialSupply];

    let interface= new ethers.utils.Interface(constructorABI);
    const encodedData = interface.encodeFunctionData("initialize", args);
    console.log("encodedData : ", encodedData);



  const loveProxy = await hre.ethers.getContractFactory("LoveProxy");
  console.log("Deploying Love Proxy...");
  const proxy = await loveProxy.deploy
  (
    implementation, // implementation V1 contract
    encodedData // bytes memory data
  );

  await proxy.deployed();
  console.log("Love PROXY address: ", proxy.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });