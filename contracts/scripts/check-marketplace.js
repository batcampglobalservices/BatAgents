const hre = require("hardhat");

async function main() {
  const marketplaceAddress = "0x54c31DE1B30f572e6016655096a545a2299D518d";
  console.log("Checking Marketplace at:", marketplaceAddress);
  const Marketplace = await hre.ethers.getContractAt("Marketplace", marketplaceAddress);
  
  const monthlyCreatorFeeWei = await Marketplace.monthlyCreatorFeeWei();
  console.log("monthlyCreatorFeeWei:", monthlyCreatorFeeWei.toString(), "wei (", hre.ethers.formatEther(monthlyCreatorFeeWei), "tokens)");

  const owner = await Marketplace.owner();
  console.log("Marketplace Owner:", owner);

  const royalties = await Marketplace.royalties();
  console.log("Royalties contract:", royalties);

  const agentNFT = await Marketplace.agentNFT();
  console.log("agentNFT contract:", agentNFT);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
