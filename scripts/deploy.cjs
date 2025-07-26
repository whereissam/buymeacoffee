const hre = require("hardhat");

async function main() {
  console.log("Deploying GiveMeCoffee contract...");

  const GiveMeCoffee = await hre.ethers.getContractFactory("GiveMeCoffee");
  const giveMeCoffee = await GiveMeCoffee.deploy();

  await giveMeCoffee.waitForDeployment();

  const contractAddress = await giveMeCoffee.getAddress();
  console.log("GiveMeCoffee deployed to:", contractAddress);

  const network = await hre.ethers.provider.getNetwork();
  console.log("Deployed on network:", network.name, "( Chain ID:", network.chainId, ")");

  console.log("Contract owner:", await giveMeCoffee.owner());
  
  if (network.chainId === 84532n || network.chainId === 8453n) {
    console.log("Waiting for block confirmations...");
    await giveMeCoffee.deploymentTransaction().wait(5);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Basescan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });