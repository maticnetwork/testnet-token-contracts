const Token = artifacts.require("./contracts/Token.sol")
const Vesting = artifacts.require("./contracts/TokenVesting.sol")
const BigNumber = web3.utils.BigNumber

const toWei = web3.utils.toWei
async function increaseBlockTime(seconds) {
  return web3.currentProvider.send(
    {
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [seconds],
      id: new Date().getTime()
    },
    () => {}
  )
}
async function mineOneBlock() {
  return web3.currentProvider.send(
    {
      jsonrpc: "2.0",
      method: "evm_mine",
      id: new Date().getTime()
    },
    () => {}
  )
}

require("chai")
  .use(require("chai-bignumber")(BigNumber))
  .should()

contract("Token", async accounts => {
  let owner = accounts[0]
  let token
  let vesting

  before(async function() {
    token = await Token.new("Matic test", "MATIC", 18, toWei("100"), {
      from: owner
    })
    const total = await token.totalSupply.call()
    vesting = await Vesting.new(token.address, { from: owner })
    await token.transfer(vesting.address, total, { from: owner })
  })

  describe("Token Vesting", function() {
    it("should add vesting for user1 ", async function() {
      const amount = toWei("10")
      let block = await web3.eth.getBlock("latest")
      let blockTime = block.timestamp
      let time = new Date(blockTime)
      time.setMinutes(time.getMinutes() + 6)
      time = +time

      await vesting.addVesting(accounts[1], "" + time, amount, { from: owner })
    })

    it("should add vesting for user2", async function() {
      const amount = toWei("10")
      let block = await web3.eth.getBlock("latest")
      let blockTime = block.timestamp
      let time = new Date(blockTime)
      time.setMinutes(time.getMinutes() + 6)
      time = +time

      await vesting.addVesting(accounts[2], "" + time, amount, { from: owner })
    })

    it("should add vesting for user3", async function() {
      const amount = toWei("80")
      let block = await web3.eth.getBlock("latest")
      let blockTime = block.timestamp
      let time = new Date(blockTime)
      time.setMinutes(time.getMinutes() + 6)
      time = +time
      await vesting.addVesting(accounts[3], "" + time, amount, { from: owner })
    })

    it("should test token vesting for user1", async function() {
      let seconds = 60 * 6000
      await increaseBlockTime(seconds)
      await mineOneBlock()

      const amount = toWei("10")
      await vesting.release(1)
      const balance = await token.balanceOf.call(accounts[1])
      assert.equal(balance.toString(), amount.toString())
    })

    it("should test token vesting for user1", async function() {
      let seconds = 60 * 6000
      await increaseBlockTime(seconds)
      await mineOneBlock()
      const amount = toWei("10")
      await vesting.release(2)
      const balance = await token.balanceOf.call(accounts[2])
      assert.equal(balance.toString(), amount.toString())
    })

    it("should test token vesting for user1", async function() {
      let seconds = 60 * 6000
      await increaseBlockTime(seconds)
      await mineOneBlock()
      const amount = toWei("80")
      await vesting.release(3)
      const balance = await token.balanceOf.call(accounts[3])
      assert.equal(balance.toString(), amount.toString())
    })
  })
})
