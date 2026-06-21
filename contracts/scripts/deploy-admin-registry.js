const hre = require("hardhat");

async function main() {
  console.log("Starting deployment for AdminRegistry on 0G Testnet...");

  // Get network and deployer info
  const network = await hre.ethers.provider.getNetwork();
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("=====================================");
  console.log(`Chain ID:   ${network.chainId}`);
  console.log(`Network:    ${hre.network.name}`);
  console.log(`Deployer:   ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance:    ${hre.ethers.formatEther(balance)} tokens`);
  console.log("=====================================\n");

  // Prevent deployment on mainnet or if balance is 0 for safety
  if (balance === 0n) {
    console.error("Error: Deployer wallet has 0 balance.");
    process.exit(1);
  }

  // Deploy AdminRegistry
  console.log("Deploying AdminRegistry...");
  const AdminRegistry = await hre.ethers.getContractFactory("AdminRegistry");
  const adminRegistry = await AdminRegistry.deploy();

  await adminRegistry.waitForDeployment();
  const contractAddress = await adminRegistry.getAddress();

  console.log("\n✅ Deployment Successful!");
  console.log("-------------------------------------");
  console.log(`AdminRegistry deployed to: ${contractAddress}`);
  console.log("-------------------------------------\n");
  
  console.log("Next steps:");
  console.log("1. Add the deployed contract address to your .env files:");
  console.log(`   NEXT_PUBLIC_ADMIN_REGISTRY_ADDRESS=${contractAddress}`);
}

main().catch((error) => {
  console.error("Deployment failed!");
  console.error(error);
  process.exitCode = 1;
});
