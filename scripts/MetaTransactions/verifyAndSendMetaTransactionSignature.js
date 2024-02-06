const { ethers } = require("hardhat");
const { readFileSync } = require("fs");

function getInstance(name) {
  const address = JSON.parse(readFileSync("deploy.json"))[name];
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`);
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

async function main() {
  const forwarder = await getInstance("MinimalForwarder");
  const simpleExchange = await getInstance("SimpleExchange");
  const mockToken = await getInstance("MockToken");
  const accounts = await ethers.getSigners();
  console.log(
    `Testing request tmp/request.json on forwarder at ${forwarder.address}...`
  );
  const { request, signature } = JSON.parse(readFileSync("request.json"));

  try {
    const valid = await forwarder.verify(request, signature);
    console.log(
      `Signature ${signature} for request is${!valid ? " not " : " "}valid`
    );

    //  signer approving the simple exchange contract to spend its erc20 token
    // const approvalTransaction = await mockToken
    //   .connect(accounts[0])
    //   .approve(
    //     simpleExchange.address,
    //     "10000000000000000000000000000000000000"
    //   );
    // const approvalTxReceipt = await approvalTransaction.wait(1);
    // console.log(
    //   "**@ approvalTxReceipt is , ",
    //   approvalTxReceipt.transactionHash
    // );

    //  executing the transaction
    const transactionResponse = await forwarder
      .connect(accounts[1])
      .execute(request, signature);

    const transactionReceipt = await transactionResponse.wait(1);
    console.log(
      "**@ request executed , txHash  is , ",
      transactionReceipt.transactionHash
    );
  } catch (err) {
    console.log(`Could not validate signature for request: ${err.message}`);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// approving erc20 predicate and doing transaction (internally failed)
// https://goerli.etherscan.io/tx/0x9f99a982a38c100e22c3c846406dbada286e079810b9a7a4e5dc75800713351c

//  approving forwarder and doing transaction (internally failed)
//https://goerli.etherscan.io/tx/0xcc41399466f613986913a393ca26fda33c03577c70e5061b4153aa08a9537997

//  approving root chain manager and doing transaction (internally failed)
// https://goerli.etherscan.io/tx/0x7126ce35186d49dad1f183a9d49ac8944546395ec56c7b73b516254abd6e12e1

// *****************************************************************

//  success for simple exchange by approving the fee payer address first
// https://rinkeby.etherscan.io/tx/0xe4e2da183b8909a0df893fd992a9a5d32fde4114a3daeab9f453858a4bc9b7d1
