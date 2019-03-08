require("babel-register")
require("babel-polyfill")

var HDWalletProvider = require("truffle-hdwallet-provider")
const MNEMONIC = process.env.MNEMONIC
const API_KEY = process.env.API_KEY

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    test: {
      host: "localhost",
      port: 8545,
      network_id: "*" // match any network
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          `https://kovan.infura.io/${API_KEY}`
        )
      },
      network_id: 42,
      gas: 8000000
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          `https://mainnet.infura.io/${API_KEY}`
        )
      },
      network_id: 1,
      gas: 4000000
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    version: "0.4.24"
  },
  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      gasPrice: 21,
      outputFile: "/dev/null",
      showTimeSpent: true
    }
  }
}
