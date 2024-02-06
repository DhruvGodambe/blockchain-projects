const { ethers } = require("hardhat");
const { writeFileSync } = require("fs");

async function main() {
  let result = {};


    let wallet = ethers.Wallet.createRandom();
    result[`account_${1}`] = {};
    result[`account_${1}`].address = wallet.address;
    result[`account_${1}`].mnemonic = wallet.mnemonic.phrase;
    result[`account_${1}`].privateKey = wallet.privateKey;

    console.log(result);
  //    writing accounts to the accounts.json file
  //   writeFileSync("accounts.json", JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
