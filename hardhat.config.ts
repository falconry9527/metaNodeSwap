import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


// config
const { config: dotenvConfig } = require("dotenv")
const { resolve } = require("path")
dotenvConfig({ path: resolve(__dirname, "./.env") })

const SEPOLIA_PK_ONE = process.env.SEPOLIA_PK_ONE
// const SEPOLIA_PK_TWO = process.env.SEPOLIA_PK_TWO
if (!SEPOLIA_PK_ONE) {
  throw new Error("Please set at least one private key in a .env file")
}

const SEPOLIA_ALCHEMY_AK = process.env.SEPOLIA_ALCHEMY_AK
if (!SEPOLIA_ALCHEMY_AK) {
  throw new Error("Please set your SEPOLIA_ALCHEMY_AK in a .env file")
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${SEPOLIA_ALCHEMY_AK}`,
      accounts: [`${SEPOLIA_PK_ONE}`],
    },
  },
};

export default config;
