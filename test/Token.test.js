const ethUtils = require("ethereumjs-util")

const Token = artifacts.require("./contracts/Token.sol")
const BigNumber = web3.BigNumber
const helper = require("./helper")

const packageJSON = require("../package.json")

require("chai")
  .use(require("chai-bignumber")(BigNumber))
  .should()

contract("Token", async accounts => {
  describe("total supply", function() {
    let owner = accounts[0]
    let token
    let Wallets
    before(async function() {
      token = await Token.new("Matic test", "MTX", 18, 100, {
        from: owner
      })

      Wallets = helper.generateFirstWallets(packageJSON.config.mnemonics, 10)
    })
    it("returns the total amount of tokens", async function() {
      let total = await token.totalSupply()
      total = web3.toWei(total)
      const balance = await token.balanceOf(owner)
      total.should.be.bignumber.equal(balance)
    })
    it("should test token transfer", async function() {
      const amount = web3.toWei(1)
      await token.transfer(accounts[1], amount)
      const balance = await token.balanceOf(accounts[1])
      balance.should.be.bignumber.equal(amount)
    })
    it("should test token transfer", async function() {
      const amount = web3.toWei(5)
      const to = accounts[2]
      const nonce = 0
      const reward = web3.toWei(2)
      // const data = Buffer.concat([
      //   ethUtils.toBuffer(token.address),
      //   ethUtils.toBuffer("metaTransfer"),
      //   ethUtils.toBuffer(to),
      //   ethUtils.setLengthLeft(amount, 32),
      //   ethUtils.setLengthLeft(nonce, 32),
      //   ethUtils.setLengthLeft(reward, 32)
      // ])
      // const dataHash = ethUtils.bufferToHex(ethUtils.keccak256(data))
      const sdata = await token.metaTransferHash(to, amount, nonce, reward)
      const sig = helper.getSig({
        pk: Wallets[0].getPrivateKeyString(),
        data: sdata
      })
      //bytes memory signature, address to, uint256 value, uint256 nonce, uint256 reward
      await token.metaTransfer(sig, to, amount, nonce, reward, {
        from: accounts[3]
      })

      let balance = await token.balanceOf(accounts[2])
      // balance.should.be.bignumber.equal(amount)
      balance = await token.balanceOf(accounts[3])
      // balance.should.be.bignumber.equal(reward)
    })
    it("should test token approve", async function() {
      const amount = web3.toWei(3)
      const to = accounts[2]
      const nonce = 0
      const reward = web3.toWei(4)
      // const data = Buffer.concat([
      //   ethUtils.toBuffer(token.address),
      //   ethUtils.toBuffer("metaApprove"),
      //   ethUtils.toBuffer(to),
      //   ethUtils.setLengthLeft(amount, 32),
      //   ethUtils.setLengthLeft(nonce, 32),
      //   ethUtils.setLengthLeft(reward, 32)
      // ])

      // const dataHash = ethUtils.bufferToHex(ethUtils.keccak256(data))
      const sdata = await token.metaApproveHash(to, amount, nonce, reward)
      const sig = helper.getSig({
        pk: Wallets[0].getPrivateKeyString(),
        data: sdata
      })
      //address spender, uint256 value, uint256 nonce, uint256 reward, bytes memory signature
      await token.metaApprove(to, amount, nonce, reward, sig, {
        from: accounts[3]
      })
      const allowance = await token.allowance(
        Wallets[0].getAddressString(),
        accounts[2]
      )
      allowance.should.be.bignumber.equal(amount)

      const balance = await token.balanceOf(accounts[3])
      balance.should.be.bignumber.equal(reward)
    })
  })

  // describe("transfers", function() {})
  //keccak256(abi.encodePacked(address(this), "metaTransfer", to, value, nonce, reward))
  // describe("Meta transactions", function() {})
})
