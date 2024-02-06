import { ethers } from "hardhat";
import { assert, expect } from "chai";
import {
    StakingToken,
    StakingToken__factory,
    RewardToken,
    RewardToken__factory,
    StakingPool,
    StakingPool__factory,
} from "../../typechain-types";
import { BigNumber, Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { createVerifySignaturesInstructionsSolana } from "@certusone/wormhole-sdk";

describe("Staking Pool", () => {
    let accounts: Signer[], owner: Signer, user: Signer, user2: Signer;

    let ownerAddress: string, userAddress: string, user2Address: string;

    let stakingTokenAddress: string,
        rewardTokenAddress: string,
        poolAddress: string;

    let StakingToken: StakingToken__factory,
        stakingToken: StakingToken,
        RewardToken: RewardToken__factory,
        rewardToken: RewardToken,
        StakingPool: StakingPool__factory,
        stakingPool: StakingPool;

    let interval: BigNumber;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        owner = accounts[0];
        user = accounts[1];
        user2 = accounts[2];

        ownerAddress = await accounts[0].getAddress();
        userAddress = await accounts[1].getAddress();
        user2Address = await accounts[2].getAddress();

        //Staking Token

        StakingToken = (await ethers.getContractFactory(
            "StakingToken"
        )) as StakingToken__factory;
        stakingToken = await StakingToken.deploy();
        await stakingToken.deployed();
        stakingTokenAddress = stakingToken.address;

        // Reward Token

        RewardToken = (await ethers.getContractFactory(
            "RewardToken"
        )) as RewardToken__factory;
        rewardToken = await RewardToken.deploy();
        await rewardToken.deployed();
        rewardTokenAddress = rewardToken.address;

        // Staking Pool

        StakingPool = (await ethers.getContractFactory(
            "StakingPool"
        )) as StakingPool__factory;
        stakingPool = await StakingPool.deploy(
            stakingTokenAddress,
            rewardTokenAddress
        );
        const poolReceipt = await stakingPool.deployed();
        poolAddress = stakingPool.address;
        interval = await stakingPool.minDuration();

        // Mint & Approve
        const mintAmount: BigNumber = ethers.utils.parseUnits("200.0");
        const mint = await stakingToken
            .connect(owner)
            .mint(ownerAddress, mintAmount);

        const approve = await stakingToken
            .connect(owner)
            .approve(poolAddress, mintAmount);

        const mintRWDAmount: BigNumber = ethers.utils.parseUnits("200.0");
      
        const mintRWD = await rewardToken
            .connect(owner)
            .mint(poolAddress, mintRWDAmount);

        // await time.increase(3600);
    });

    describe("Constructor", () => {
        it("Should set Staking Token Address correctly", async () => {
            const stakingAddress = await stakingPool.stakingToken();

            assert.equal(stakingAddress, stakingTokenAddress);
        });

        it("Should set Reward Token Address correctly", async () => {
            const rewardAddress = await stakingPool.rewardToken();

            assert.equal(rewardAddress, rewardTokenAddress);
        });
    });

    describe("State Variable", () => {
        it("Should return value of Minimum Duration", async () => {
            let time: number = 60;
            const minDuration = await stakingPool.minDuration();

            assert.equal(minDuration.toNumber(), time);
        });

        it("Should return value of Annual reward percentage", async () => {
            let percentage: number = 2000;
            const rewardPercentage = await stakingPool.rewardPercentage();

            assert.equal(rewardPercentage.toNumber(), percentage);
        });

        it("Should return value of YEAR in sec", async () => {
            let yearSec: number = 365 * 24 * 60 * 60;
            const YEAR = await stakingPool.YEAR();

            assert.equal(YEAR.toNumber(), yearSec);
        });
    });

    describe("Stake", () => {
        it("When User Stake, StakingToken will be sent to Staking Contract", async () => {
            const _amount: BigNumber = ethers.utils.parseUnits("100.0");

            const stake = await stakingPool.connect(owner).stake(_amount);
            const stakeReceipt = await stake.wait();

            const balanceOfPool = await stakingToken
                .connect(owner)
                .balanceOf(poolAddress);

            assert.equal(_amount.toString(), balanceOfPool.toString());
        });
    });

    describe("Unstake", () => {
        it("When User Unstake, reward token should be sent to user", async () => {
            const _amount: BigNumber = ethers.utils.parseUnits("100.0");

            const stake = await stakingPool.connect(owner).stake(_amount);
            await stake.wait();

            //Time Travel
            await ethers.provider.send("evm_increaseTime", [
                interval.toNumber() + 120,
            ]);

            const _positionIndex: number = 0;
            const unstake = await stakingPool
                .connect(owner)
                .Unstake(_positionIndex);

            const unstakeReceipt = await unstake.wait();

            const reward = unstakeReceipt.events![2].args!._rewardAmount;

            const balanceOfUserRWD = await rewardToken
                .connect(owner)
                .balanceOf(ownerAddress);

            assert.equal(reward, balanceOfUserRWD.toNumber());
        });

        it("When User Unstake, Staking token should be sent to user", async () => {
            const _amount: BigNumber = ethers.utils.parseUnits("100.0");

            const stake = await stakingPool.connect(owner).stake(_amount);
            await stake.wait();

            //Time Travel
            await ethers.provider.send("evm_increaseTime", [
                interval.toNumber() + 120,
            ]);

            const _positionIndex: number = 0;
            const unstake = await stakingPool
                .connect(owner)
                .Unstake(_positionIndex);

            const unstakeReceipt = await unstake.wait();

            const intialAmount = unstakeReceipt.events![2].args!._stakedAmount;

            const balanceOfUserRJ = await stakingToken
                .connect(owner)
                .balanceOf(ownerAddress);

            const currentBalance: BigNumber = ethers.utils.parseUnits("100.0");

            assert.equal(intialAmount.toString(), _amount.toString());
        });
    });
});
