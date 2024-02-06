const { ethers} = require("hardhat");

const AdminRegistryabi = require('../../artifacts/contracts/Registry/AdminRegistry.sol/AdminRegistry.json');

const adminRegistryAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"
const adminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const treasuryAddress = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"
console.log("Before main");

const PrivateKey = process.env.PRIVATE_KEY_LOCALHOST_1;
const providerURL = process.env.PROVIDER_URL;

const main = async () => {
    const provider = new ethers.providers.JsonRpcProvider(providerURL);
    console.log("provider set");

    const accounts = await ethers.getSigners();
    const admin  = accounts[0];
    const treasury = accounts[9];
    

    const AdminRegistry = new ethers.Contract(adminRegistryAddress, AdminRegistryabi.abi, provider);
    console.log("AdminRegistry",AdminRegistry);

    const tx = await AdminRegistry.isAdmin(adminAddress);
    console.log("Is Admin", tx);

    const tx1 = await AdminRegistry.isTreasury(treasuryAddress);
    console.log("Is treasury", tx1);

    const tx2 = await AdminRegistry.connect(admin).addAdmin("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    console.log("Add Admin", tx2);
    await tx2.wait();

    // const tx3 = await AdminRegistry.leaveRole(treasuryAddress);
    // console.log("Is treasury", tx);

    // const tx4 = await AdminRegistry.connect(admin).removeAdmin("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
    // console.log("Remove Admin", tx4);
    // await tx4.wait();

    const tx5 = await AdminRegistry.getAdminRoleMembers();
    console.log("get Admin Role Members  : ", tx5);

    const tx6 = await AdminRegistry.getTreasuryRoleMembers();
    console.log("get Treasury Role Members  :", tx6);


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error: ", error);
    process.exit(1);
  });