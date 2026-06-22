const hre = require("hardhat");

async function main() {
  const marketplaceAddress = "0x54c31DE1B30f572e6016655096a545a2299D518d";
  console.log("Checking listings on Marketplace at:", marketplaceAddress);
  const Marketplace = await hre.ethers.getContractAt("Marketplace", marketplaceAddress);
  
  try {
    const listing = await Marketplace.listings(1);
    console.log("listing(1):", listing);
  } catch (err) {
    console.log("Failed reading listings(1):", err.message);
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
