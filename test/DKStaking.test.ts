import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { log } from "console";

const { expectRevert, time } = require("@openzeppelin/test-helpers");


// describe("====>Registry<====", function () {
//   let accounts: Signer[];
//   let owner: Signer;
//   let user: Signer;
//   let ownerAddress: string;
//   let userAddress: string;
//   let userAddress2: string;
//   let AdminRegistry: any;
//   let adminRegistry: any;

//   this.beforeAll(async function () {
//     accounts = await ethers.getSigners();
//     AdminRegistry = await ethers.getContractFactory("AdminRegistry");
//   });

//   this.beforeEach(async () => {
//     owner = accounts[0];
//     user = accounts[1];
//     ownerAddress = await accounts[0].getAddress();
//     userAddress = await accounts[1].getAddress();
//     userAddress2 = await accounts[2].getAddress();

//     adminRegistry = await AdminRegistry.deploy(ownerAddress);
//     await adminRegistry.deployed();
//     console.log("AdminRegistry deployed at ", adminRegistry.address);

//   });

//   it ("Check if is Admin", async () => {
//     let tx = await adminRegistry.isAdmin(ownerAddress);
//     console.log(tx);
    
//   });

//   it ("Should add Admin", async () => {
//     let tx = await adminRegistry.connect(owner).addAdmin(ownerAddress);
//     console.log(tx);
    
//   });

//   it ("Should remove Admin", async () => {
//     let tx = await adminRegistry.connect(owner).removeAdmin(ownerAddress);
//     console.log(tx);
    
//   });

//   it ("Should leave as Admin", async () => {
//     let tx = await adminRegistry.connect(owner).leaveRole();
//     console.log(tx);
    
//   });

//   it ("All in one Registry Tests", async () => {
//     let tx = await adminRegistry.isAdmin(userAddress);
//     console.log(tx);
    
//     let tx2 = await adminRegistry.connect(owner).addAdmin(userAddress);

//     let tx3 = await adminRegistry.isAdmin(userAddress);
//     console.log(tx3);

//     let tx4 = await adminRegistry.connect(owner).removeAdmin(userAddress);
//     let tx5 = await adminRegistry.isAdmin(userAddress);
//     console.log(tx5);
    
//   })
// });

// describe("====>PremiumNFT<====", function () {
//   let accounts: Signer[];
//   let owner: Signer;
//   let user: Signer;
//   let ownerAddress: string;
//   let userAddress: string;
//   let userAddress2: string;
//   let AdminRegistry: any;
//   let adminRegistry: any;
//   let PremiumNFT: any;
//   let premiumNFT: any;

//   this.beforeAll(async function () {
//     accounts = await ethers.getSigners();

//     AdminRegistry = await ethers.getContractFactory("AdminRegistry");
//     PremiumNFT = await ethers.getContractFactory('PremiumNFT');

// });

//   this.beforeEach(async () => {
//     owner = accounts[0];
//     user = accounts[1];
//     ownerAddress = await accounts[0].getAddress();
//     userAddress = await accounts[1].getAddress();
//     userAddress2 = await accounts[2].getAddress();

//     adminRegistry = await AdminRegistry.deploy(ownerAddress);
//     await adminRegistry.deployed();
//     console.log("AdminRegistry deployed at ", adminRegistry.address);


//     premiumNFT = await PremiumNFT.deploy("Knight Templer Distillery", "KTD", adminRegistry.address);
//     await premiumNFT.deployed();
//     console.log("PremiumNFT deployed at ", premiumNFT.address);
//   });

//   it ("Checking tokensStaked Status", async () => {
//     console.log(await premiumNFT.balanceOf(ownerAddress));
//     console.log(await premiumNFT.tokenStaked(100));

//     let tx = await premiumNFT.connect(owner).mint(ownerAddress);
//     const receipt = await tx.wait();

//     console.log(await premiumNFT.balanceOf(ownerAddress));

//     console.log(await premiumNFT.tokenStaked(1));
//   });

//   it ("Should set base uri", async () => {
//     let tx = await premiumNFT.connect(owner).setBaseURI("https://carbon.xyz/");
//     console.log(await premiumNFT.baseURI());
    
//   });

// });




describe("====>Staking<====", function () {
  let accounts: Signer[];
  let owner: Signer;
  let user: Signer;
  let ownerAddress: string;
  let userAddress: string;
  let userAddress2: string;
  let AdminRegistry: any;
  let adminRegistry: any;
  let Staking: any;
  let staking: any;
  let StakeFactory: any;
  let stakeFactory: any;
  let Enoch: any;
  let enoch: any;
  let PremiumNFT: any;
  let premiumNFT: any;

  let StakingInstance: any;


  this.beforeAll(async function () {
    accounts = await ethers.getSigners();

    AdminRegistry = await ethers.getContractFactory("AdminRegistry");
    Staking = await ethers.getContractFactory("Staking");
    StakeFactory = await ethers.getContractFactory("StakeFactory");
    Enoch = await ethers.getContractFactory('Enoch');
    PremiumNFT = await ethers.getContractFactory('PremiumNFT');

  });

  this.beforeEach(async () => {
    owner = accounts[0];
    user = accounts[1];
    ownerAddress = await accounts[0].getAddress();
    userAddress = await accounts[1].getAddress();
    userAddress2 = await accounts[2].getAddress();

    console.log("Aho!");

    adminRegistry = await AdminRegistry.deploy(ownerAddress);
    await adminRegistry.deployed();
    console.log("AdminRegistry deployed at ", adminRegistry.address);
    
    staking = await Staking.deploy();
    await staking.deployed();
    console.log("Staking deployed at ", staking.address);

    stakeFactory = await StakeFactory.deploy();
    await stakeFactory.deployed();
    console.log("Factory deployed at ", stakeFactory.address);

    enoch = await Enoch.deploy(adminRegistry.address);
    await enoch.deployed();
    console.log("Enoch deployed at ", enoch.address);

    premiumNFT = await PremiumNFT.deploy("Knight Templer Distillery", "KTD", adminRegistry.address);
    await premiumNFT.deployed();
    console.log("PremiumNFT deployed at ", premiumNFT.address);

    await stakeFactory.initialize(staking.address, adminRegistry.address);

  });


  it ("Should set up staking contract", async () => {

    let ownerBal = await enoch.balanceOf(ownerAddress);
    console.log("bal:", ownerBal);
    
    let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3, adminRegistry.address);
    
    const receipt = await tx.wait();
    let event = receipt.events?.find((event:any) => event.event === "StakeCreated");
    console.log("event: ", event?.args);

    StakingInstance = await Staking.attach(event?.args?._stake);
    // console.log("Staking Instance", StakingInstance);
    let stakingAddress: any = event?.args?._stake;
    
    console.log("Let's fetch some public values from StakingInstance");

    let rewardToken = await StakingInstance.rewardToken();
    console.log("reward Token", rewardToken);

    console.log("Adding this Staking Instance as the Admin in Registry");
    let txn = await adminRegistry.connect(owner).addAdmin(stakingAddress);
    
    console.log("setting up the reward Constant");

    let tx2 = await StakingInstance.connect(owner).setRewardConstant(11000);
    console.log("tx2", tx2);

    let rewardConstant = await StakingInstance.REWARD_CONSTANT();
    console.log(rewardConstant);
    
    console.log("mint nft and do approval wala thing");
    let tx3 = await premiumNFT.connect(owner).mint(ownerAddress);
    let tx4 = await premiumNFT.connect(owner).approve(stakingAddress, 1);
    
    console.log("Now let's stake");
    let tx5 = await StakingInstance.stake(ownerAddress, 1, 100);
    const receipt2 = await tx5.wait();
    const event2 = receipt2.events?.find((event:any) => event.event === "NFTStaked");
    console.log("stake event", event2?.args);
    

    console.log("bal:", await enoch.balanceOf(ownerAddress));
    
    console.log("getting stake info");
    let tx7 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    console.log(
      "staking timestamp",tx7[0].toString(), "\n",
      "stakedValue",tx7[1].toString(), "\n",
      "totalClaimable rewards",tx7[2].toString(), "\n",
      "ClaimedRewards",tx7[3].toString(), "\n",
      "reward Installment",tx7[4].toString(), "\n",
      "last withdrawal time",tx7[5].toString(), "\n"
    );
    

    // owner of staked NFT
    let txn1 = await premiumNFT.ownerOf(1);
    console.log("nft owner", txn1);
    

    await new Promise((res) => setTimeout(() => res(null), 8000));
    
    console.log("let's make the rewards claimable after 15 seconds each");

    console.log("claiming first installment");
    
    let firstTx = await StakingInstance.connect(owner).claimReward(ownerAddress, 1);

    console.log("getting stake info");
    let tx8 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    console.log(
      "staking timestamp",tx8[0].toString(), "\n",
      "stakedValue",tx8[1].toString(), "\n",
      "totalClaimable rewards",tx8[2].toString(), "\n",
      "ClaimedRewards",tx8[3].toString(), "\n",
      "reward Installment",tx8[4].toString(), "\n",
      "last withdrawal time",tx8[5].toString(), "\n"
    );

    ///////

    await new Promise((res) => setTimeout(() => res(null), 8000));
    
    console.log("let's make the rewards claimable after 15 seconds each");

    console.log("claiming second installment");
    
    let secondTx = await StakingInstance.connect(owner).claimReward(ownerAddress, 1);

    console.log("getting stake info");
    let tx9 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    console.log(
      "staking timestamp",tx9[0].toString(), "\n",
      "stakedValue",tx9[1].toString(), "\n",
      "totalClaimable rewards",tx9[2].toString(), "\n",
      "ClaimedRewards",tx9[3].toString(), "\n",
      "reward Installment",tx9[4].toString(), "\n",
      "last withdrawal time",tx9[5].toString(), "\n"
    );
    
    /////

    await new Promise((res) => setTimeout(() => res(null), 8000));
    
    console.log("let's make the rewards claimable after 15 seconds each");

    console.log("claiming third installment");
    
    let thirdTx = await StakingInstance.connect(owner).claimReward(ownerAddress, 1);

    console.log("getting stake info");
    let tx10 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    console.log(
      "staking timestamp",tx10[0].toString(), "\n",
      "stakedValue",tx10[1].toString(), "\n",
      "totalClaimable rewards",tx10[2].toString(), "\n",
      "ClaimedRewards",tx10[3].toString(), "\n",
      "reward Installment",tx10[4].toString(), "\n",
      "last withdrawal time",tx10[5].toString(), "\n"
    );


    /////

    // owner of staked NFT
    let txn2 = await premiumNFT.ownerOf(1);
    console.log("nft owner", txn2);

    await new Promise((res) => setTimeout(() => res(null), 8000));
    
    console.log("let's make the rewards claimable after 15 seconds each");

    console.log("claiming fourth installment");
    
    let fourthTx = await StakingInstance.connect(owner).claimReward(ownerAddress, 1);

    console.log("getting stake info");
    // let tx8 = await StakingInstance.getStakedInfo(ownerAddress, 1);
    // console.log(
    //   "staking timestamp",tx8[0].toString(), "\n",
    //   "stakedValue",tx8[1].toString(), "\n",
    //   "totalClaimable rewards",tx8[2].toString(), "\n",
    //   "ClaimedRewards",tx8[3].toString(), "\n",
    //   "reward Installment",tx8[4].toString(), "\n",
    //   "last withdrawal time",tx8[5].toString(), "\n"
    // );


    
    
  });

  // it ("Chalo stake karte hai", async () => {
  //   let tx1 = await premiumNFT.connect(owner).mint(ownerAddress, 1);
  //   let tx2 = await premiumNFT.connect(owner).approve(staking.address, 1);
  //   let tx3 = await staking.connect(owner).setRewardConstant(11633);

  //   let tx = await staking.connect(owner).stake(ownerAddress, 1, 100);
  //   console.log("Staked!");

  //   console.log("\nUser Stake Info\n");
  //   let tx4 = await staking.connect(owner).getStakedInfo(ownerAddress, 1);
  //   console.log(tx4);
  // });

  // it ("Let's do some caln.", async () => {
  //   let x = 0.85;
  //   x += 1;
  //   console.log("x", x);
  //   let y = 0.25;
  //   console.log("y", y);
    
  //   let val = (x**y).toPrecision(5);
  //   console.log("exponent", val);
  // });

  // it ("Calling calculate rewards", async () => {
  //   console.log("The owner calling", ownerAddress);
    
  //   let tx1 = await staking.setRewardConstant(10000);
  //   // const receipt = await tx1.wait();
  //   // console.log("tx1", tx1);
    
  //   let tx = await staking._calculateRewards(100);
  //   // const receipt2 = await tx.wait();
  //   // console.log("tx", receipt2);
    
  // });

  // it ("Creating StakingProxy using StakeFactory",async () => {
  //   let tx = await stakeFactory.connect(owner).setupStakeContract(premiumNFT.address, enoch.address, 90, 3);
  //   console.log(tx);
    
   
  // })


});
