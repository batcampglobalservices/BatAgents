const hre = require("hardhat");

async function main() {
  const addresses = [
    "0xa51FabE8F60044A9db55A3874F2Ab37f8485bd11", // NFT
    "0x54c31DE1B30f572e6016655096a545a2299D518d", // Marketplace
  ];
  for (const address of addresses) {
    const code = await hre.ethers.provider.getCode(address);
    console.log(`${address} code size: ${code.length} bytes (hex: ${code.substring(0, 40)}...)`);
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
