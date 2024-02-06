import {ethers} from 'hardhat';
const hre = require("hardhat");

const runmain = async () => {
    
    console.log("Deploying test sign...");

    const TestSign = await hre.ethers.getContractFactory("TestSign");
    const testSign = await TestSign.deploy();

    await testSign.deployed();
    console.log("TestSign Address : ", testSign.address);

    const obj = {"nonce":326843,"message":"Ankit is here signing in at 2022-12-21T07:23:23.144Z"} ;
    const signature = "0x54a901522b301ce452cbe0d288ecc0eeec55957621271c12a781f5cb006e69684635dbf63c537a465b0b75d88c53b2032a69157fca1da1d4b98f4a7b1b654bf71b";

    const str = JSON.stringify(obj);
    console.log("str : ", str);

    //Step 1
    let tx1 = await testSign.getMessageHash(str);
    console.log("get message hash tx11 : ", tx1);
    
    //Step 2
    let tx2 = await testSign.getEthSignedMessageHash(tx1);
    console.log("get eth signed message hash :", tx2);
    
    //Step 3
    let tx3 = await testSign.recoverSigner(tx2, signature);
    console.log("recover signer : ", tx3 );

    //Step 4
    let tx4 = await testSign.verify("0xdcb04bdea6d21a638d0161405f31fc8511867d3f", tx1, signature);
    console.log("Signer matching : ", tx4);



};

runmain()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });