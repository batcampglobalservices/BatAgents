const hre = require("hardhat");

async function main() {
  const marketplaceAddress = "0x378B76beE85dcc4998ED099ED3373C8438e73958";
  console.log("Configuring Marketplace at:", marketplaceAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  const Marketplace = await hre.ethers.getContractAt("Marketplace", marketplaceAddress, deployer);

  const fee = hre.ethers.parseEther("0.05"); // 0.05 0G
  console.log("Setting monthlyCreatorFeeWei to 0.05 0G (", fee.toString(), "wei)...");
  
  const tx = await Marketplace.setMonthlyCreatorFeeWei(fee);
  console.log("Transaction sent. Hash:", tx.hash);
  
  await tx.wait();
  console.log("Transaction confirmed! Monthly fee is set.");

  const currentFee = await Marketplace.monthlyCreatorFeeWei();
  console.log("Verification - current monthlyCreatorFeeWei:", currentFee.toString());
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
