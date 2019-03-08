const ethUtils = require("ethereumjs-util")

const Token = artifacts.require("./contracts/Token.sol")
const BigNumber = web3.BigNumber
const helper = require("./helper")

require("chai")
  .use(require("chai-bignumber")(BigNumber))
  .should()

contract("Token", async accounts => {
  let owner = accounts[0]
  beforeEach(async function() {
    this.token = await Token.new("Matic test", "MTX", 18, 100, { from: owner })
  })

  describe("total supply", function() {
    it("returns the total amount of tokens", async function() {
      let total = await this.token.totalSupply()
      total = web3.toWei(total)
      const balance = await this.token.balanceOf(owner)
      total.should.be.bignumber.equal(balance)
    })
  })

  describe("transfers", function() {
    it("should test token transfer", async function() {
      const amount = web3.toWei(1)
      await this.token.transfer(accounts[1], amount)
      const balance = await this.token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(amount)
    })
  })
  //keccak256(abi.encodePacked(address(this), "metaTransfer", to, value, nonce, reward))
  describe("Meta transactions", function() {
    it("should test token transfer", async function() {
      const amount = web3.toWei(10)
      const to = accounts[2]
      const nonce = 0
      const reward = web3.toWei(0.5)
      const data = Buffer.concat([
        ethUtils.toBuffer(this.token.address),
        ethUtils.toBuffer("metaTransfer"),
        ethUtils.toBuffer(to),
        ethUtils.setLengthLeft(amount, 32),
        ethUtils.setLengthLeft(nonce, 32),
        ethUtils.setLengthLeft(reward, 32)
      ])
      const sig = helper.getSig({
        pk: helper.Wallets[0].getPrivateKey(),
        data: data
      })
      //bytes memory signature, address to, uint256 value, uint256 nonce, uint256 reward
      let out = await this.token.metaTransfer(sig, to, amount, nonce, reward, {
        from: accounts[3]
      })
      console.log(accounts[0])
      console.log(out)
      console.log("\n")
      const balance = await this.token.balanceOf(accounts[0])
      // balance.should.be.bignumber.equal(amount)
      console.log(balance)
      const balance1 = await this.token.balanceOf(accounts[2])
      // balance.should.be.bignumber.equal(amount)
      console.log(balance1)

      const balance2 = await this.token.balanceOf(accounts[3])
      // balance.should.be.bignumber.equal(amount)
      console.log(balance2)
    })
  })
})
