const hre = require("hardhat");

async function main() {
  console.log("Starting deployment for Royalties on 0G Testnet...");

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

  // Prevent deployment if balance is 0 or too low for safety
  const minRequiredBalance = hre.ethers.parseEther("0.001");
  if (balance < minRequiredBalance) {
    console.error(`Error: Deployer wallet balance is too low (${hre.ethers.formatEther(balance)} tokens). Minimum required is 0.001 tokens.`);
    process.exit(1);
  }

  // Deploy Royalties
  const platformFeeBps = 500; // 5% platform fee
  console.log(`Deploying Royalties with platform fee ${platformFeeBps} BPS (5%)...`);
  const Royalties = await hre.ethers.getContractFactory("Royalties");
  const royalties = await Royalties.deploy(platformFeeBps);

  await royalties.waitForDeployment();
  const contractAddress = await royalties.getAddress();

  console.log("\n✅ Deployment Successful!");
  console.log("-------------------------------------");
  console.log(`Royalties deployed to: ${contractAddress}`);
  console.log("-------------------------------------\n");
  
  console.log("Next steps:");
  console.log("1. Add the deployed contract address to your .env files:");
  console.log(`   ROYALTIES_ADDRESS=${contractAddress}`);
}

main().catch((error) => {
  console.error("Deployment failed!");
  console.error(error);
  process.exitCode = 1;
});
