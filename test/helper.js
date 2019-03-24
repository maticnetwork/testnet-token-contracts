const bip39 = require("bip39")
const hdkey = require("ethereumjs-wallet/hdkey")

const ethUtils = require("ethereumjs-util")

module.exports = {
  generateFirstWallets: function generateFirstWallets(
    mnemonics,
    n,
    hdPathIndex = 0
  ) {
    const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonics))
    const result = []
    for (let i = 0; i < n; i++) {
      const node = hdwallet.derivePath(`m/44'/60'/0'/0/${i + hdPathIndex}`)
      result.push(node.getWallet())
    }

    return result
  },
  //keccak256(abi.encodePacked(token, "metaTransfer", to, value, nonce, reward))
  getSig: function({ pk, data }) {
    const dataHash = ethUtils.keccak256(data)
    const messageHash = ethUtils.hashPersonalMessage(dataHash)
    const sigObj = ethUtils.ecsign(messageHash, ethUtils.toBuffer(pk))
    const sig = ethUtils.toRpcSig(sigObj.v, sigObj.r, sigObj.s)

    return sig
  }
}
