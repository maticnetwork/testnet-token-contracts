const ethUtils = require("ethereumjs-util")

const Token = artifacts.require("./contracts/Token.sol")
const BigNumber = web3.utils.BigNumber
const helper = require("./helper")

const packageJSON = require("../package.json")

const toWei = web3.utils.toWei

require("chai")
  .use(require("chai-bignumber")(BigNumber))
  .should()

contract("Token", async accounts => {
  let owner = accounts[0]
  let token
  let Wallets

  before(async function() {
    token = await Token.new("Matic test", "MTX", 18, toWei("100"), {
      from: owner
    })

    Wallets = helper.generateFirstWallets(packageJSON.config.mnemonics, 10)
  })

  describe("total supply", function() {
    it("returns the total amount of tokens", async function() {
      const total = await token.totalSupply.call()
      const balance = await token.balanceOf.call(owner)
      assert.equal(total.toString(), balance.toString())
    })

    it("should test token transfer", async function() {
      const amount = toWei("1")
      await token.transfer(accounts[1], amount)
      const balance = await token.balanceOf.call(accounts[1])
      assert.equal(balance.toString(), amount.toString())
    })

    // it("should test token meta transfer", async function() {
    //   const amount = toWei("5")
    //   const to = accounts[2]
    //   const nonce = 0
    //   const reward = toWei("2")
    //   //keccak256(abi.encodePacked(address(this), "metaTransfer", to, value, nonce, reward));
    //   const data = Buffer.concat([
    //     ethUtils.toBuffer(token.address),
    //     ethUtils.toBuffer("metaTransfer"),
    //     ethUtils.toBuffer(to),
    //     ethUtils.setLengthLeft(+amount, 32),
    //     ethUtils.setLengthLeft(nonce, 32),
    //     ethUtils.setLengthLeft(+reward, 32)
    //   ])

    //   const sig = helper.getSig({
    //     pk: Wallets[0].getPrivateKeyString(),
    //     data: data
    //   })

    //   //bytes memory signature, address to, uint256 value, uint256 nonce, uint256 reward
    //   await token.metaTransfer(sig, to, amount, nonce, reward, {
    //     from: accounts[3]
    //   })

    //   let balance = await token.balanceOf(accounts[2])
    //   balance.should.be.bignumber.equal(amount)
    //   balance = await token.balanceOf(accounts[3])
    //   balance.should.be.bignumber.equal(reward)
    // })

    // it("should test token meta approve", async function() {
    //   const amount = toWei("5")
    //   const to = accounts[2]
    //   const nonce = 1
    //   const reward = toWei("2")

    //   //abi.encodePacked(address(this), "metaApprove", spender, value, nonce, reward)
    //   const data = Buffer.concat([
    //     ethUtils.toBuffer(token.address),
    //     ethUtils.toBuffer("metaApprove"),
    //     ethUtils.toBuffer(to),
    //     ethUtils.setLengthLeft(+amount, 32),
    //     ethUtils.setLengthLeft(nonce, 32),
    //     ethUtils.setLengthLeft(+reward, 32)
    //   ])

    //   const sig = helper.getSig({
    //     pk: Wallets[0].getPrivateKeyString(),
    //     data: data
    //   })
    //   // address spender, uint256 value, uint256 nonce, uint256 reward, bytes memory signature
    //   await token.metaApprove(to, amount, nonce, reward, sig, {
    //     from: accounts[4]
    //   })
    //   const allowance = await token.allowance(
    //     Wallets[0].getAddressString(),
    //     accounts[2]
    //   )
    //   allowance.should.be.bignumber.equal(amount)

    //   const balance = await token.balanceOf(accounts[4])
    //   balance.should.be.bignumber.equal(reward)
    // })
  })
})