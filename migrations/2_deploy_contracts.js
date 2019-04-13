const Token = artifacts.require("./MaticToken.sol")
const TokenVesting = artifacts.require("./MaticTokenVesting.sol")

module.exports = async function(deployer) {
  deployer.then(async () => {
    let totalSupply = web3.utils.toBN(10000000000)
    totalSupply = totalSupply.mul(web3.utils.toBN(10 ** 18))

    await deployer.deploy(
      Token,
      "Testnet Matic Token",
      "MATIC",
      18,
      totalSupply
    )
    await deployer.deploy(TokenVesting, Token.address)
    const tokenContract = await Token.deployed()
    await tokenContract.transfer(TokenVesting.address, totalSupply)
  })
}
