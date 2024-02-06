const { expect } = require("chai");
const { ethers } = require("hardhat");

let accounts, Enoch, EnochInstance;

describe("Enoch", () => {
    beforeEach(async () => {
        accounts = await ethers.getSigners();

        Enoch = await ethers.getContractFactory("Enoch");
        EnochInstance = await Enoch.deploy();
    })

    it('should transfer all tokens to deployer account address', async () => {
        
        const deployer_balance = await EnochInstance.functions.balanceOf(accounts[0].address);
        
        expect(deployer_balance.toString()).to.equal('6000000000000000000000000');
    })

    it('should tranfer 100 ENOCH from deployer address to another address', async () => {
        
        await EnochInstance.connect(accounts[0]).transfer(accounts[1].address, 1000000000000);

        const balance0 = await EnochInstance.balanceOf(accounts[0].address);
        console.log("ENOCH balance of account 0: ", balance0.toString());

        const balance1 = await EnochInstance.balanceOf(accounts[1].address);
        console.log("ENOCH balance of account 1: ", balance1.toString())
        
        expect(balance1.toString()).to.equal("1000000000000");
    })

    it('should allow owner to mint 100 ENOCH', async () => {
        await EnochInstance.connect(accounts[0]).mint(accounts[0].address, 1000000000000);

        const balance0 = await EnochInstance.balanceOf(accounts[0].address);
        console.log("ENOCH balance of account 0 after minting 100 ENOCH: ", balance0.toString());
    })

    it('should not allow other accounts, except for owner, to mint ENOCH', async () => {
        try {
            await EnochInstance.connect(accounts[1]).mint(accounts[1].address, 1000000000000);
        } catch(e) {
            console.log(e.toString());
            expect(e.toString()).to.equal("Error: VM Exception while processing transaction: reverted with reason string 'You are not authorized to mint FINA'");
        }
    })

    // it('should find a bug', async () => {
    //     let EnochInstance = await FinAxis.deployed();
    //     let balance0 = await EnochInstance.balanceOf(accounts[0].address);
    //     console.log('balance of account 0 before:', balance0.toString());

    //     try {
    //         const tx = await EnochInstance.transferFrom(accounts[0].address, accounts[3].address, 5000000000000,{
    //             from: accounts[1].address
    //         })
    //     } catch(e) {
    //         console.log(e.reason);
    //     }
    //     EnochInstance = await FinAxis.deployed();
    //     balance0 = await EnochInstance.balanceOf(accounts[0].address)
    //     console.log('balance of account 0 after:', balance0.toString());
    // })
<<<<<<< HEAD
})
=======
})
>>>>>>> 5de5d7725babc9598ef034234c82510ac9204ba4
