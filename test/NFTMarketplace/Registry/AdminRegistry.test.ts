import { ethers } from "hardhat";
import { assert, expect } from "chai";
import { AdminRegistry, AdminRegistry__factory } from "../../../typechain-types";
import { Signer } from "ethers";

describe("Admin Registry", () => {
    let accounts: Signer[],
        owner: Signer,
        user: Signer,
        user2: Signer,
        treasurer: Signer;
    let ownerAddress: string,
        userAddress: string,
        user2Address: string,
        treasuryAddress: string;
    let AdminRegistry: AdminRegistry__factory, adminRegistry: AdminRegistry;

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        owner = accounts[0];
        user = accounts[1];
        user2 = accounts[2];
        treasurer = accounts[9];

        ownerAddress = await accounts[0].getAddress();
        userAddress = await accounts[1].getAddress();
        user2Address = await accounts[2].getAddress();
        treasuryAddress = await accounts[9].getAddress();

        AdminRegistry = (await ethers.getContractFactory(
            "AdminRegistry"
        )) as AdminRegistry__factory;
        adminRegistry = await AdminRegistry.deploy(
            ownerAddress,
            treasuryAddress
        );
        await adminRegistry.deployed();
    });

    it("should set constructor addresses correctly", async () => {
        const admin = ownerAddress;
        const treasurer = treasuryAddress;

        assert.equal(admin, ownerAddress);
        assert.equal(treasurer, treasuryAddress);
    });

    it("Should Check user is a Admin", async () => {
        const tx = await adminRegistry.connect(owner).isAdmin(ownerAddress);

        expect(tx).to.be.true;
    });

    it("Should Check user is a Treasurer", async () => {
        const tx = await adminRegistry
            .connect(owner)
            .isTreasury(treasuryAddress);

        expect(tx).to.be.true;
    });

    it("Only admin can add new admin", async () => {
        const tx1 = await adminRegistry.connect(owner).addAdmin(user2Address);
        const tx1Receipt = await tx1.wait();
        const sender = tx1Receipt.events![0].args!.sender;

        assert.equal(ownerAddress, sender);
    });

    // it("User can leave their role", async () => {});
    it("Only Admin can remove other admin role", async () => {
        const tx1 = await adminRegistry.connect(owner).addAdmin(userAddress);
        const tx1Receipt = await tx1.wait();
        const sender = tx1Receipt.events![0].args!.sender;

        assert.equal(ownerAddress, sender);
    });

    it("Returns Admin Role Members", async () => {
        const numbOfAdmins: number = 1;
        const tx = await adminRegistry.connect(owner).getAdminRoleMembers();

        expect(tx).to.deep.equal([numbOfAdmins.toString(), [ownerAddress]]);
    });

    it("Should return Treasury Role Members", async () => {
        const numbOfTreasurer: number = 1;
        const tx = await adminRegistry.connect(owner).getTreasuryRoleMembers();

        expect(tx).to.deep.equal([
            numbOfTreasurer.toString(),
            [treasuryAddress],
        ]);
    });
});
