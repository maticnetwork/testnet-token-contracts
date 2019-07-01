const Token = artifacts.require("MaticToken")
// const TokenVesting = artifacts.require("MaticTokenVesting")
const TokenAirdrop = artifacts.require("MaticTokenAirdrop")
const SCALING_FACTOR = web3.utils.toBN(10 ** 18)

module.exports = async function(deployer) {
  deployer
  .then(async () => {
    let totalSupply = web3.utils.toBN(10000000000)
    totalSupply = totalSupply.mul(SCALING_FACTOR)

    await deployer.deploy(
      Token,
      "Testnet Matic Token",
      "MATIC",
      18,
      totalSupply
    )
    // await deployer.deploy(TokenVesting, Token.address)
    // const tokenContract = await Token.deployed()
    // await tokenContract.transfer(TokenVesting.address, totalSupply)
  })
  .then(async () => {
    const tokenContract = await Token.deployed()
    await deployer.deploy(TokenAirdrop, Token.address)
    await tokenContract.transfer(TokenAirdrop.address, web3.utils.toBN(48198).mul(SCALING_FACTOR))
  })
}
