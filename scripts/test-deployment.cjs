require("dotenv").config();
const hre = require("hardhat");

const CONTRACT_ADDRESS = "0x98e6660178EB04D2de2687e7a61b082d81A5BFdf";
const CONTRACT_ABI = [
  "function totalDonations() external view returns (uint256)",
  "function getBalance() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function getDonationCount() external view returns (uint256)"
];

async function testDeployment() {
  console.log("🧪 Testing deployed contract...\n");
  
  try {
    const provider = new hre.ethers.JsonRpcProvider("https://sepolia.base.org");
    const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    console.log("📍 Contract Address:", CONTRACT_ADDRESS);
    console.log("👤 Contract Owner:", await contract.owner());
    console.log("💰 Current Balance:", hre.ethers.formatEther(await contract.getBalance()), "ETH");
    console.log("📊 Total Donations:", hre.ethers.formatEther(await contract.totalDonations()), "ETH");
    console.log("📋 Donation Count:", (await contract.getDonationCount()).toString());
    
    console.log("\n✅ Contract is working correctly!");
    console.log("🌐 View on BaseScan:", `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`);
    console.log("🖥️  Test the app at: http://localhost:5174/coffee");
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
}

testDeployment();