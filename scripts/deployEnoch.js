const hre = require("hardhat");

async function main() {

  const Enochtoken = await hre.ethers.getContractFactory("Enoch");
  const enoch = await Enochtoken.deploy();

  await enoch.deployed();

  console.log("Enoch token deployed to", enoch.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });