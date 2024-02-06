import { ethers } from "hardhat";
import {
    StakingToken,
    StakingToken__factory,
    RewardToken,
    RewardToken__factory,
    StakingPool,
    StakingPool__factory,
} from "../../typechain-types";
import { BigNumber } from "ethers";

const main = async () => {
    let StakingToken: StakingToken__factory,
        stakingToken: StakingToken,
        RewardToken: RewardToken__factory,
        rewardToken: RewardToken,
        StakingPool: StakingPool__factory,
        stakingPool: StakingPool;

    let StakingTokenAddress: string,
        RewardTokenAddress: string,
        poolAddress: string;

    let interval: BigNumber;

    const accounts = await ethers.getSigners();

    const owner = accounts[0];
    const user = accounts[1];

    const ownerAddress = await accounts[0].getAddress();
    const userAddress = await accounts[1].getAddress();
    const user2Address = await accounts[2].getAddress();
    const user3Address = await accounts[3].getAddress();

    console.log("\n---------- Deploying RJToken Contract ----------");

    StakingToken = (await ethers.getContractFactory(
        "StakingToken"
    )) as StakingToken__factory;
    stakingToken = await StakingToken.deploy();
    await stakingToken.deployed();
    StakingTokenAddress = stakingToken.address;

    console.log(`RjToken deployed at --> ${StakingTokenAddress}`);

    console.log("\n---------- Deploying RWDToken Contract ----------");

    RewardToken = (await ethers.getContractFactory(
        "RewardToken"
    )) as RewardToken__factory;
    rewardToken = await RewardToken.deploy();
    await rewardToken.deployed();
    RewardTokenAddress = rewardToken.address;

    console.log(`RWDToken deployed at --> ${RewardTokenAddress}`);

    console.log("\n---------- Deploying StakingPool Contract ----------");

    StakingPool = (await ethers.getContractFactory(
        "StakingPool"
    )) as StakingPool__factory;
    stakingPool = await StakingPool.deploy(
        StakingTokenAddress,
        RewardTokenAddress
    );
    const poolReceipt = await stakingPool.deployed();
    poolAddress = stakingPool.address;
    interval = await stakingPool.minDuration();

    console.log(poolAddress);

    console.log(
        "\n----------------------Mint & Approve of RJToken------------------------\n"
    );

    const mintAmount: BigNumber = ethers.utils.parseUnits("200.0");

    const mint = await stakingToken
        .connect(owner)
        .mint(ownerAddress, mintAmount);

    const approve = await stakingToken
        .connect(owner)
        .approve(poolAddress, mintAmount);

    const rjBalance = await stakingToken.connect(owner).balanceOf(ownerAddress);
    console.log(`BalanceOf Owner-->${rjBalance.toString()}`);

    console.log("\n-------------------Mint RWDToken------------------------\n");

    const mintRWDAmount: BigNumber = ethers.utils.parseUnits("200.0");

    const mintRWD = await rewardToken
        .connect(owner)
        .mint(poolAddress, mintRWDAmount);

    const balanceOfPool = await rewardToken
        .connect(owner)
        .balanceOf(poolAddress);
    console.log(`BalanceOf Pool-->${balanceOfPool.toString()}`);

    console.log("\n-------------Reward before Staking----------------------\n");

    const rwdBalance = await rewardToken.connect(owner).balanceOf(ownerAddress);
    console.log(`RewardOf Owner-->${rwdBalance.toString()}`);

    console.log("\n------------------Staking----------------------------\n");

    const _amount: BigNumber = ethers.utils.parseUnits("100.0");

    const tx1 = await stakingPool.connect(owner).stake(_amount);
    const tx1Receipt = await tx1.wait();
    // console.log(tx1Receipt);

    let time = tx1Receipt.events![2].args!._timestamp;
    let date = new Date(time * 1000).toLocaleTimeString("it-IT");

    console.log(
        `\nStaked User Address -->${tx1Receipt.events![2].args!._user}`
    );
    console.log(`\nStaked Amount -->${tx1Receipt.events![2].args!._amount}`);
    console.log(`\nStaked Time -->${date}`);

    console.log("\n---------------------Unstake-------------------------\n");
    const _positionIndex: number = 0;
    await ethers.provider.send("evm_increaseTime", [interval.toNumber()]);

    const tx2 = await stakingPool.connect(owner).Unstake(_positionIndex);
    const tx2Receipt = await tx2.wait();

    const rewardAmount = tx2Receipt.events![2].args!._rewardAmount;
    const stakedAmount = tx2Receipt.events![2].args!._stakedAmount;
    const unstakeTime = tx2Receipt.events![2].args!._timestamp;
    let unstakeDate = new Date(unstakeTime * 1000).toLocaleTimeString("it-IT");

    console.log(`Reward Amount --> ${rewardAmount}\n`);
    console.log(`Staked Amount --> ${stakedAmount}\n`);
    console.log(`Unstake Time -->${unstakeDate}\n`);
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
