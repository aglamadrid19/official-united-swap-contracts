require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-web3");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.8.1",
      }
    ]
  }
};
