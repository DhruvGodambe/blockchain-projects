const { ethers } = require("hardhat");
const abi = require("../../../artifacts/contracts/Tokens/ERC1155.sol/GameItems.json");

const main = async () => {
    const accounts = await ethers.getSigners();

    owner = accounts[0];
    user = accounts[1];

    ownerAddress = await accounts[0].getAddress();
    userAddress = await accounts[1].getAddress();

    console.log(`---------- Creating Instance of ERC1155 ----------\n`);

    const GameItems = await ethers.getContractFactory("GameItems", owner);
    const gameItems = await GameItems.deploy();
    const txReceipt = await gameItems.deployed();

    console.log(txReceipt);
    console.log(`Contract Address ==> ${txReceipt.address}\n`);

    console.log(`---------- Calling safeTransferFrom ----------`);
    const id = 2;
    const amount = 1;
    const data = 0x00;

    const tx1 = await gameItems.connect(owner).safeTransferFrom(
        ownerAddress,
        userAddress,
        id,
        amount,
        data
    );

    const tx1Receipt = await tx1.wait();

    //   console.log(tx1Receipt);
    //   console.log(tx1Receipt.events[0].args);
    console.log("\nFrom Address", tx1Receipt.events[0].args.from);
    console.log("To Address", tx1Receipt.events[0].args.to);
    console.log("ERC1155 Id", tx1Receipt.events[0].args.id);
    console.log("ERC1155 value", tx1Receipt.events[0].args.value);

    console.log(`\n---------- Calling balanceOf ----------\n`);

    const tx2 = await gameItems.balanceOf(userAddress, id);

    //   console.log(tx2);
    console.log("balanceOf Address is", tx2);

    console.log(`\n---------- Calling uri func ----------\n`);

    const tx3 = await gameItems.uri(id);

    //   console.log("\n", tx3);
    console.log(`URI of ID ${id} is ==> ${tx3}`);

    console.log(`\n---------- Calling mint func ----------\n`);

    const _account = ownerAddress;
    const _id = 5;
    const _amount = BigInt(1000000000000);
    const _data = "0x";

    const tx4 = await gameItems.connect(owner).mint(_account, _id, _amount, _data);
    const tx4Receipt = await tx4.wait();

    // console.log(tx4Receipt);
    //   console.log(tx4Receipt.events[0].args);
    console.log("\nFrom Address", tx4Receipt.events[0].args.from);
    console.log("To Address", tx4Receipt.events[0].args.to);
    console.log("ERC1155 Id", tx4Receipt.events[0].args.id);
    console.log("ERC1155 value", tx4Receipt.events[0].args.value);

    console.log(`\n---------- Calling mintBatch func ----------\n`);

    const _to = userAddress;
    const _ids = [6, 7, 8];
    const _amounts = [100, 200, 300];

    const tx5 = await gameItems.connect(owner).mintBatch(_to, _ids, _amounts, _data);
    const tx5Receipt = await tx5.wait();

    // console.log(tx5Receipt);
    //   console.log(tx5Receipt.events[0].args);
    console.log("\nFrom Address", tx5Receipt.events[0].args.from);
    console.log("To Address", tx5Receipt.events[0].args.to);
    console.log("ERC1155 Ids", tx5Receipt.events[0].args.ids);
    console.log("ERC1155 value", tx5Receipt.events[0].args[4]);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
