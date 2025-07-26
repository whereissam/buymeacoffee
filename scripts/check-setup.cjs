require("dotenv").config();

async function checkSetup() {
  console.log("🔍 Checking your setup...\n");
  
  // Check private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey === "your_private_key_here") {
    console.log("❌ Private key not set properly in .env file");
    console.log("📝 Please update PRIVATE_KEY in .env with your actual private key");
    console.log("💡 The private key should be 64 characters long (without 0x prefix)");
    console.log("💡 Example: PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    return false;
  }
  
  if (privateKey.length !== 64) {
    console.log("❌ Private key should be exactly 64 characters (without 0x prefix)");
    console.log(`📏 Current length: ${privateKey.length} characters`);
    return false;
  }
  
  console.log("✅ Private key format looks correct");
  
  // Try to get wallet address
  try {
    const hre = require("hardhat");
    const [deployer] = await hre.ethers.getSigners();
    const address = await deployer.getAddress();
    
    console.log("✅ Wallet address:", address);
    console.log("\n🚰 To get testnet ETH, visit:");
    console.log("   • https://faucet.quicknode.com/base/sepolia");
    console.log("   • https://www.alchemy.com/faucets/base-sepolia");
    console.log(`   • Enter your address: ${address}`);
    
    return true;
    
  } catch (error) {
    console.log("❌ Error loading wallet:", error.message);
    return false;
  }
}

checkSetup().catch(console.error);