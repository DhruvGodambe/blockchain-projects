# Development Procedure

## To Deploy tokens
`npx hardhat run scripts/UUPS/deployERC20Impl.js --network sepolia`
Set Implementation Address in deployERC20Proxy.js file
`npx hardhat run scripts/UUPS/deployERC20Proxy.js --network sepolia`
Then set Implementation address, proxy address and constructor params in verify.js file
`npx hardhat run scripts/verify.js --network sepolia`
Go to etherscan after verification and select "Is this a Proxy?" option and set the contract as proxy.