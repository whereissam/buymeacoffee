const hre = require("hardhat");

async function main() {
  console.log("Deploying GiveMeCoffee contract for demo...");

  const GiveMeCoffee = await hre.ethers.getContractFactory("GiveMeCoffee");
  const giveMeCoffee = await GiveMeCoffee.deploy();

  await giveMeCoffee.waitForDeployment();

  const contractAddress = await giveMeCoffee.getAddress();
  console.log("GiveMeCoffee deployed to:", contractAddress);
  console.log("Contract owner:", await giveMeCoffee.owner());
  
  console.log("\nContract deployed successfully!");
  console.log("You can now update your .env file with:");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  
  console.log("\nTesting contract functionality...");
  
  const [owner, donor] = await hre.ethers.getSigners();
  
  console.log("Sending test donation...");
  const donationAmount = hre.ethers.parseEther("0.001");
  const tx = await giveMeCoffee.connect(donor).donate("Test donation from demo script", { 
    value: donationAmount 
  });
  await tx.wait();
  
  console.log("Test donation successful!");
  console.log("Contract balance:", hre.ethers.formatEther(await giveMeCoffee.getBalance()), "ETH");
  console.log("Total donations:", hre.ethers.formatEther(await giveMeCoffee.totalDonations()), "ETH");
  
  console.log("\nDemo deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });