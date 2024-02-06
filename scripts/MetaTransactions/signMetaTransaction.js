const { ethers, network } = require("hardhat");
const { signMetaTxRequest } = require("../../utils/signer");
const { readFileSync, writeFileSync } = require("fs");

const DEFAULT_NAME = "sign-test";

function getInstance(name) {
  const address = JSON.parse(readFileSync("deploy.json"))[name];
  if (!address) throw new Error(`Contract ${name} not found in deploy.json`);
  return ethers.getContractFactory(name).then((f) => f.attach(address));
}

async function main() {
  const forwarder = await getInstance("MinimalForwarder");
  // const registry = await getInstance("Registry");
  const mockToken = await getInstance("MockToken");
  const simpleExchange = await getInstance("SimpleExchange");

  // signing simple registry
  // const { NAME: name, PRIVATE_KEY_2: signer } = process.env;
  // const from = new ethers.Wallet(signer).address;
  // console.log(`Signing registration of ${name || DEFAULT_NAME} as ${from}...`);
  // const data = registry.interface.encodeFunctionData("register", [
  //   name || DEFAULT_NAME,
  // ]);
  // const result = await signMetaTxRequest(signer, forwarder, {
  //   to: registry.address,
  //   from,
  //   data,
  // });

  // writeFileSync("request.json", JSON.stringify(result, null, 2));
  // console.log(`Signature: `, result.signature);
  // console.log(`Request: `, result.request);

  //  signing mockToken transfer
  let from;
  let to;
  let amount = "10000000000000000000";

  const accounts = await ethers.getSigners();

  // if (network.config.chainId == 31337) {
  //   const accounts = await ethers.getSigners();
  //   from = accounts[0].address;
  //   to = accounts[1].address;
  // } else {
  const { PRIVATE_KEY_1: signer, PRIVATE_KEY_2: sender } = process.env;
  from = new ethers.Wallet(signer).address;

  to = new ethers.Wallet(sender).address;
  // }
  console.log(
    `Signing mockToken transfer of amount  ${amount} from ${from}...  to ${to}`
  );
  //  signer approving the forwarder contract to spend its erc20 token
  // const approvalTransaction = await mockToken
  //   .connect(accounts[0])
  //   .approve(forwarder.address, "10000000000000000000000000000000000000");
  // const approvalTxReceipt = await approvalTransaction.wait(1);
  // console.log("**@ approvalTxReceipt is , ", approvalTxReceipt.transactionHash);

  const data = simpleExchange.interface.encodeFunctionData("deposit", [amount]);
  const result = await signMetaTxRequest(signer, forwarder, {
    to: simpleExchange.address,
    from: from,
    data,
  });

  writeFileSync("request.json", JSON.stringify(result, null, 2));
  console.log(`Signature: `, result.signature);
  console.log(`Request: `, result.request);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
