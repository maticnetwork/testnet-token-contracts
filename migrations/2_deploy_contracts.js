const Token = artifacts.require("./Token.sol")

module.exports = function(deployer) {
  deployer.deploy(Token, "Testnet Matic Token", "MATIC", 18, 10000000000)
}
