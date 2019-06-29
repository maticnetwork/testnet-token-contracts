const assert = require('assert')

const parseCsv = require('../test/utils').parseCsv
const Token = artifacts.require("./contracts/MaticToken.sol")
const Airdrop = artifacts.require("./contracts/MaticTokenAirdrop.sol")
const SCALING_FACTOR = web3.utils.toBN(10 ** 18)

async function fireTx() {
  let { recipients, amounts, airdropSupply } = await parseCsv(web3)
  const airdrop = await Airdrop.at(process.env.AIRDROP_CONTRACT)
  const token = await Token.at(process.env.TOKEN_CONTRACT)
  airdropSupply = web3.utils.toBN(airdropSupply).mul(SCALING_FACTOR)
  let airdropContractBalance = await token.balanceOf.call(airdrop.address)
  console.log('airdropContractBalance', airdropContractBalance.toString())
  assert.ok(airdropContractBalance.eq(airdropSupply), 'airdropSupply assertion failed')

  return airdrop.airdropTokens(recipients, amounts)
}

module.exports = async function(callback) {
  // perform actions
  try {
    const tx = await fireTx();
    console.log(tx)
    console.log('gasUsed', tx.receipt.gasUsed)
    callback();
  } catch (e) {
    console.log(e)
  }
}
