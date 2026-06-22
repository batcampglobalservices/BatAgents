const hre = require("hardhat");

async function main() {
  const marketplaceAddress = "0x54c31DE1B30f572e6016655096a545a2299D518d";
  console.log("Diag for address:", marketplaceAddress);
  
  // Try reading it as Marketplace
  try {
    const Marketplace = await hre.ethers.getContractAt("Marketplace", marketplaceAddress);
    const owner = await Marketplace.owner();
    console.log("Read owner successfully:", owner);
  } catch (err) {
    console.log("Failed reading owner:", err.message);
  }

  try {
    const Marketplace = await hre.ethers.getContractAt("Marketplace", marketplaceAddress);
    const agentNFT = await Marketplace.agentNFT();
    console.log("Read agentNFT successfully:", agentNFT);
  } catch (err) {
    console.log("Failed reading agentNFT:", err.message);
  }

  // Try reading it as AgentAccessControl
  try {
    const AccessControl = await hre.ethers.getContractAt("AgentAccessControl", marketplaceAddress);
    const royalties = await AccessControl.royalties();
    console.log("Read royalties from AgentAccessControl:", royalties);
  } catch (err) {
    console.log("Failed reading royalties:", err.message);
  }

  // Try reading it as UsageTracker
  try {
    const UsageTracker = await hre.ethers.getContractAt("UsageTracker", marketplaceAddress);
    const backendSigner = await UsageTracker.backendSigner();
    console.log("Read backendSigner from UsageTracker:", backendSigner);
  } catch (err) {
    console.log("Failed reading backendSigner:", err.message);
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
