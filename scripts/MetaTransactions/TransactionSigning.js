const { ethers } = require('hardhat');
const Tx = require('ethereumjs-tx');

const main = async () => {
    [account, account2] = await ethers.getSigners();

    // console.log("Accounts: ", account);

    const gasPrice = account.getGasPrice();

    // building the transaction
    const txn = {
        from: account.address,
        to: account2.address,
        value: ethers.utils.parseUnits("1", "ether"),
        gasPrice: gasPrice,
        gasLimit: ethers.utils.hexlify(100000),
        nonce: account.getTransactionCount(),
    };
    console.log("Account: ", (await account.getBalance()).toString());
    console.log("Account2: ", (await account2.getBalance()).toString());

    // const transaction = await account.sendTransaction(tx);
    // signing the transaction
    txn.sign(Buffer.from('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', "hex"));

    // send txn
    const { hash } = await account.sendTransaction("0x" + txn.serialize().toString("hex"));

    await account.waitForTransaction(hash);

    console.log(hash);


    // let txn = await account.signTransaction(tx).then(ethers.utils.serializeTransaction(tx));

    // console.log("Raw hash: ", txn);


    console.log("Account: ", (await account.getBalance()).toString());
    console.log("Account2: ", (await account2.getBalance()).toString());


    // #######################################

    // let message = "Hello World";

    // let flatSign = await account.signMessage(message);

    // console.log(flatSign);

    // let sig = ethers.utils.splitSignature(flatSign);
    // console.log(sig);

    // let transaction = await account.signTransaction(tx);

    // console.log(transaction);



}

main(); 


