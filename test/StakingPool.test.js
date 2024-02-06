const { except } = require("chai");
const { ethers } = require("hardhat");

describe("StakingPool Test", () => {
  let owner, user;
  let ownerAddress, userAddress;
  before(async () => {
    const accounts = await ethers.getSigners();

    owner = accounts[0];
    user = accounts[1];

    ownerAddress = await accounts[0].getAddress();
    userAddress = await accounts[1].getAddress();

    const RJToken = await ethers.getContractFactory("RjToken", owner);
    const rjToken = await RJToken.deploy();
    const txRJToken = await rjToken.deployed();
    // console.log(txRJToken);
    console.log(`RJToken deployed at --> ${rjToken.address}`);

    const RWDToken = await ethers.getContractFactory("RWDToken", owner);
    const rwdToken = await RWDToken.deploy();
    const txRWDToken = await rwdToken.deployed();
    // console.log(txRWDToken);
    console.log(`RWDToken deployed at --> ${rwdToken.address}`);

    let address = {
      _stakingToken: rjToken.address,
      _rewardToken: rwdToken.address,
    };

    const StakingPool = await ethers.getContractFactory("StakingPool", owner);
    const stakingPool = await StakingPool.deploy(address);
    const txStakingPool = await stakingPool.deployed();
    await txStakingPool.constructor();
    // console.log(txStakingPool);
    console.log(`Staking Pool deployed at --> ${stakingPool.address}`);
  });

  describe("deploy", () => {
    it("Should set RJToken", async () => {
      except(await stakingPool.stakingToken()).to.equal(rjToken.address);
    });
    it("Should set RWDToken", async () => {
      except(await stakingPool.rewardsToken()).to.equal(rwdToken.address);
    });
    it("Should set Owner", async () => {
      except(await stakingPool.owner()).to.equal(ownerAddress);
    });
  });

  describe("Stake RJToken", () => {
    before(async () => {
      let tx1 = await rjToken
        .connect(owner)
        .mint(userAddress, 150000000000000000000);
      const receipt1 = await tx1.wait();
      console.log(`Minting done and transferd to ${userAddress}`);
    });
    it("Should check balance ", async () => {
      except((await rjToken.balanceOf(userAddress)) > 0).to.be.revertedWith(
        "Not enough balance"
      );
    });
    it("Should Transfer Token to Contract", async () => {
      let userBal = await rjToken.balanceOf(userAddress);
      let tx2 = await rjToken
        .connect(user)
        .transferFrom(userAddress, stakingPool.address, userBal)
        .to.be.revertedWith("StakingPool__StakeFailed");

      except(await stakingPool.stakingToken()).to.equal(rjToken.address);
      except(userAddress > 0).to.be.revertedWith("userAddres is 0th address");
    });
  });
  describe("Unstake RJToken", () => {
    it("Should check if token is stacked or not", async () => {
      let stackedToken = await stakingPool.connect(user).userInfo.tokenStaked;
      except(stackedToken > 0).to.be.revertedWith("Not stacked any RJToken");
    });
    it("Should check 2 hr is completed", async () => {
      except(
        (await stakingPool.connect(user).userInfo.lastDepositedTime) >= 7200
      ).to.be.revertedWith("User cannot claim rewards before due time!");
    });
    it("Should transfer RJToken to their owner", async () => {
      let tokenBal = await stakingPool.connect(user).userInfo.tokenStaked;
      except(userAddress > 0).to.be.revertedWith("userAddress is 0th address");
      except(tokenBal > 0).to.be.revertedWith("Not stacked any RJToken");
      let tx1 = setTimeout(
        await stakingToken.transfer(userAddress, tokenBal),
        7200
      );
    });
  });
  describe("Reward", () => {
    it("Should check reward", async () => {
      let userReward = await stakingPool.rewards(userAddress);

      except(userReward > 0).to.be.revertedWith("No Reward for the user");
      except(
        (await stakingPool.connect(user).userInfo.lastDepositedTime) >= 7200
      ).to.be.revertedWith("User cannot claim rewards before due time!");

      let tx1 = await rewardsToken.mint(userAddress, userReward);
      await tx1.wait(2);
    });
  });

  //   it("Should stake", async () => {
  //     let tx1 = await rjToken
  //       .connect(owner)
  //       .mint(userAddress, 150000000000000000000);
  //     const receipt1 = await tx1.wait();
  //     console.log(`Minting done and transferd to ${userAddress}`);

  //     let tx2 = await stakingPool
  //       .connect(userAddress)
  //       .stake(100000000000000000000)
  //       .updateReward(userAddress);
  //     const receipt2 = await tx2.wait();
  //     console.log(receipt2);

  //     let userBal1 = await rjToken.balanceOf(userAddress);
  //     console.log("\n=> Owner's Balance (RJTokens):", userBal1.toString());
  //   });

  //   it("Should withdraw", async () => {
  //     let userBal = await rjToken.balanceOf(userAddress);
  //     except(userBal > 0).to.be.revertedWith("amount = 0");

  //     let tx1 = await
  //   });
});
