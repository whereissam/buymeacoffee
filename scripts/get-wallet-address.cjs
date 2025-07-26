const hre = require("hardhat");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    const address = await deployer.getAddress();
    
    console.log("Your wallet address:", address);
    console.log("\nTo get testnet ETH:");
    console.log("1. Visit: https://faucet.quicknode.com/base/sepolia");
    console.log("2. Enter your address:", address);
    console.log("3. Request testnet ETH");
    console.log("4. Wait for the transaction to complete");
    console.log("\nOnce you have testnet ETH, run:");
    console.log("npx hardhat run scripts/deploy.cjs --network baseSepolia");
    
  } catch (error) {
    console.error("Error: Make sure your PRIVATE_KEY is set in .env file");
    console.error("The private key should be without '0x' prefix");
  }
}

main().catch(console.error);