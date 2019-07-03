var HDWalletProvider = require("truffle-hdwallet-provider")
const MNEMONIC = process.env.MNEMONIC
const API_KEY = process.env.API_KEY

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
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
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          `https://ropsten.infura.io/v3/${API_KEY}`
        )
      },
      network_id: 3,
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

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.5.2", // Fetch exact version from solc-bin (default: truffle's version)
      docker: false, // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
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
