const hre = require("hardhat");


const verify = async () => {
    const proxy = "0x4db57D585fa82Ca32d25086DDc069d899f08D455"
    const impl = "0xA3d11dF2cD5D9144e80f56336b78A30951A3f40a"
    const encodedData = "0xfe4b84df000000000000000000000000000000000000000004d8c55aefb8c05b5c000000"

    return await hre.run("verify:verify", {
        address: proxy,
        // contract: "contracts/Tokens/LoveUUPS/LoveProxy.sol:LoveProxy",
        contract: "contracts/Tokens/Enoch.sol:Enoch",
        constructorArguments: [
          // impl,
          // encodedData
        ]
      });    
}
const main = () => {
    verify();
}

main()