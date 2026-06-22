const path = require("path");
const dotenv = require("dotenv");
require("@nomicfoundation/hardhat-toolbox");

// Load environment variables from the workspace root
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../.env") });

// Fallback key for compilation / dev-setup when env is not yet filled
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const accounts = [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`];

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "0g-testnet": {
      url: process.env.OG_RPC_URL || process.env.ZERO_G_RPC_URL || "https://rpc.ankr.com/0g_galileo_testnet_evm",
      chainId: 16602,
      accounts: accounts,
    },
  },
};
