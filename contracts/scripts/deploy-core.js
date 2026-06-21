const hre = require("hardhat");
const path = require("path");
const dotenv = require("dotenv");

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, "../../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function main() {
  console.log("Starting unified core deployment for Bat Agents on 0G Testnet...");

  const network = await hre.ethers.provider.getNetwork();
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("=====================================");
  console.log(`Chain ID:   ${network.chainId}`);
  console.log(`Network:    ${hre.network.name}`);
  console.log(`Deployer:   ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance:    ${hre.ethers.formatEther(balance)} tokens`);
  console.log("=====================================\n");

  const minRequiredBalance = hre.ethers.parseEther("0.01");
  if (balance < minRequiredBalance) {
    console.error(`Error: Deployer wallet balance is too low (${hre.ethers.formatEther(balance)} tokens). Minimum required for full deployment is 0.01 tokens.`);
    process.exit(1);
  }

  // 1. Deploy MockOracle
  console.log("Deploying MockOracle...");
  const MockOracle = await hre.ethers.getContractFactory("MockOracle");
  const mockOracle = await MockOracle.deploy();
  await mockOracle.waitForDeployment();
  const mockOracleAddress = await mockOracle.getAddress();
  console.log(`MockOracle deployed to: ${mockOracleAddress}`);

  // 2. Deploy Royalties
  const platformFeeBps = 500; // 5% platform fee
  console.log(`Deploying Royalties with platform fee ${platformFeeBps} BPS (5%)...`);
  const Royalties = await hre.ethers.getContractFactory("Royalties");
  const royalties = await Royalties.deploy(platformFeeBps);
  await royalties.waitForDeployment();
  const royaltiesAddress = await royalties.getAddress();
  console.log(`Royalties deployed to: ${royaltiesAddress}`);

  // 3. Deploy BatAgentNFT
  console.log("Deploying BatAgentNFT...");
  const BatAgentNFT = await hre.ethers.getContractFactory("BatAgentNFT");
  const batAgentNFT = await BatAgentNFT.deploy(mockOracleAddress);
  await batAgentNFT.waitForDeployment();
  const agentNFTAddress = await batAgentNFT.getAddress();
  console.log(`BatAgentNFT deployed to: ${agentNFTAddress}`);

  // 4. Deploy AgentFactory
  console.log("Deploying AgentFactory...");
  const AgentFactory = await hre.ethers.getContractFactory("AgentFactory");
  const agentFactory = await AgentFactory.deploy(agentNFTAddress);
  await agentFactory.waitForDeployment();
  const agentFactoryAddress = await agentFactory.getAddress();
  console.log(`AgentFactory deployed to: ${agentFactoryAddress}`);

  // 5. Deploy AgentAccessControl
  console.log("Deploying AgentAccessControl...");
  const AgentAccessControl = await hre.ethers.getContractFactory("AgentAccessControl");
  const accessControl = await AgentAccessControl.deploy(agentNFTAddress, royaltiesAddress);
  await accessControl.waitForDeployment();
  const accessControlAddress = await accessControl.getAddress();
  console.log(`AgentAccessControl deployed to: ${accessControlAddress}`);

  // 6. Deploy UsageTracker
  const backendSignerAddress = process.env.BACKEND_SIGNER_ADDRESS || deployer.address;
  console.log(`Deploying UsageTracker with backend signer: ${backendSignerAddress}...`);
  const UsageTracker = await hre.ethers.getContractFactory("UsageTracker");
  const usageTracker = await UsageTracker.deploy(accessControlAddress, backendSignerAddress);
  await usageTracker.waitForDeployment();
  const usageTrackerAddress = await usageTracker.getAddress();
  console.log(`UsageTracker deployed to: ${usageTrackerAddress}`);

  // 7. Deploy Marketplace
  console.log("Deploying Marketplace...");
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(agentNFTAddress, royaltiesAddress, mockOracleAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`Marketplace deployed to: ${marketplaceAddress}`);

  // 8. Link Permissions & Configurations
  console.log("\nConfiguring permissions and linkages...");
  
  console.log("- Registering AgentFactory as authorized minter on NFT contract...");
  const setFactoryTx = await batAgentNFT.setFactory(agentFactoryAddress);
  await setFactoryTx.wait();

  console.log("- Registering UsageTracker on AccessControl contract...");
  const setTrackerTx = await accessControl.setUsageTracker(usageTrackerAddress);
  await setTrackerTx.wait();

  console.log("\n✅ Core Deployment & Linking Successful!");
  console.log("=================================================================");
  console.log("Copy and paste these addresses into your .env/env.local files:");
  console.log("=================================================================");
  console.log(`MOCK_ORACLE_ADDRESS=${mockOracleAddress}`);
  console.log(`ROYALTIES_ADDRESS=${royaltiesAddress}`);
  console.log(`AGENT_NFT_ADDRESS=${agentNFTAddress}`);
  console.log(`AGENT_FACTORY_ADDRESS=${agentFactoryAddress}`);
  console.log(`MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log(`ACCESS_CONTROL_ADDRESS=${accessControlAddress}`);
  console.log(`USAGE_TRACKER_ADDRESS=${usageTrackerAddress}`);
  console.log("=================================================================\n");
}

main().catch((error) => {
  console.error("Unified deployment failed!");
  console.error(error);
  process.exitCode = 1;
});
