const { ethers} = require("hardhat");

const exchangeCoreabi = require('../../artifacts/contracts/NFTMarketplace/Exchange/ExchangeCore.sol/ExchangeCore.json');
const enochTokenabi = require('../../artifacts/contracts/Tokens/Enoch.sol/Enoch.json');


const adminAddress = "0xCB61f141D37C320B4357173ec28Af37A5E09d949";
const exchangeCoreAddress = "0xE3b4170E729471491b975cebfC3742Bcef4f1c34";
const enochTokenAddress = "0x1d3702D92A8c9Fd3fcD0220e13e5A47f56375d7b";


const main = async () => {

  const provider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/OW3K8LQl3oZeZLxuOTzgbRkFsEBkThgA");
  console.log(" PROVIDER : ", provider);

  const admin = new ethers.Wallet( "0x1d6817ca1509086f55f2f4751cf8464f305dd6ba713778d31ade993bd7b984bb" , provider );
  console.log(" Admin ADDRESS : ", admin.address);

    console.log("Inside main function ========>");

  const ExchangeCore = new ethers.Contract(exchangeCoreAddress, exchangeCoreabi.abi, provider);
    console.log("ExchangeCore : ",ExchangeCore);


    console.log("<<<<===============================================================>>>>");

  const EnochToken = new ethers.Contract(enochTokenAddress, enochTokenabi.abi, provider);
    console.log("Enoch Token : ", EnochToken);

    //@ Approving buyer token to exchange core by admin

  const tx6 = await EnochToken.connect(admin).approve(exchangeCoreAddress, "5550000000000000000000000000");
  const receipt6 = await tx6.wait();
    console.log("Approve receipt6 :", receipt6);

    console.log("Checking allowance");
    

  const tx7 = await EnochToken.connect(admin).allowance(adminAddress, exchangeCoreAddress);
    console.log("Allowance tx7 :", tx7);



    console.log("<<<<===============================================================>>>>");


};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });