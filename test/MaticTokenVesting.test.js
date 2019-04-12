const Token = artifacts.require("./contracts/MaticToken.sol")
const Vesting = artifacts.require("./contracts/MaticTokenVesting.sol")
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

async function assertRevert(promise, errorMessage = null) {
  try {
    const tx = await promise
    const receipt = await web3.eth.getTransactionReceipt(tx.tx)
    if (receipt.gasUsed >= 6700000) {
      return
    }
  } catch (error) {
    if (errorMessage) {
      assert(
        error.message.search(errorMessage) >= 0,
        `Expected ${errorMessage} `
      )
    }
    const invalidOpcode = error.message.search("revert") >= 0
    assert(invalidOpcode, "Expected revert, got '" + error + "' instead")
    return
  }
  assert.ok(false, 'Error containing "revert" must be returned')
}

require("chai")
  .use(require("chai-bignumber")(BigNumber))
  .should()

contract("Token", async accounts => {
  let owner = accounts[0]
  let token
  let vesting
  let totalSupply

  before(async function() {
    totalSupply = web3.utils.toBN(10000000000)
    totalSupply = totalSupply.mul(web3.utils.toBN(10 ** 18))
    token = await Token.new("Matic test", "MATIC", 18, totalSupply, {
      from: owner
    })
    const total = await token.totalSupply.call()
    vesting = await Vesting.new(token.address, { from: owner })
    await token.transfer(vesting.address, total, { from: owner })
  })

  describe("Token Vesting", function() {
    it("should test vesting for day zero release time", async function() {
      const vestingContractBalance = await token.balanceOf.call(vesting.address)
      assert.equal(vestingContractBalance.toString(), totalSupply.toString())
      let balance = await token.balanceOf.call(accounts[0])
      assert.equal(balance.toString(), "0")
      let amount = toWei("1900000000")
      await vesting.release(1)
      balance = await token.balanceOf.call(accounts[0])
      assert.equal(balance.toString(), amount.toString())
      amount = toWei((117990560 + 1900000000).toString())
      await vesting.release(2)
      balance = await token.balanceOf.call(accounts[0])
      assert.equal(balance.toString(), amount.toString())
    })

    it("should test token vesting for userX", async function() {
      const amount = toWei("10")
      let block = await web3.eth.getBlock("latest")
      let blockTime = block.timestamp
      let time = new Date(blockTime)
      time.setMinutes(time.getMinutes() + 6)
      time = +time
      let result = await vesting.addVesting(
        accounts[1],
        time.toString(),
        amount,
        {
          from: accounts[0]
        }
      )

      await token.transfer(vesting.address, amount)
      let balance = await vesting.vestingAmount(28)
      assert.equal(balance.toString(), amount.toString())

      // "Tokens have not vested yet"
      await assertRevert(
        vesting.release(result.receipt.logs[0].args.vestingId),
        "Tokens have not vested yet"
      )

      // Time travel
      let seconds = 60 * 6000
      await increaseBlockTime(seconds)
      await mineOneBlock()
      // test release
      await vesting.release(result.receipt.logs[0].args.vestingId)
      balance = await token.balanceOf.call(accounts[1])
      assert.equal(balance.toString(), amount.toString())
    })

    it("Removing a vesting entry with the owner account", async function() {
      let result = await vesting.removeVesting(3, { from: owner })
      await vesting.retrieveExcessTokens(result.receipt.logs[0].args["2"], {
        from: owner
      })
    })

    it("Removing a vesting entry with a non-owner account", async function() {
      await assertRevert(vesting.removeVesting(4, { from: accounts[1] })) //""
    })

    it("Trying to remove an unexistent vesting entry", async function() {
      await assertRevert(
        vesting.removeVesting(30, { from: owner }),
        "Invalid vesting id"
      )
    })

    it("Trying to remove an already released vesting entry", async function() {
      await assertRevert(
        vesting.release(1, { from: owner }),
        "Vesting already released"
      )
    })

    it("Trying to remove an already removed vesting entry", async function() {
      await assertRevert(
        vesting.removeVesting(3, { from: owner }),
        "Vesting already released"
      )
    })

    it("Trying to add a vesting entry from a non-owner account", async function() {
      const amount = toWei("10")
      let block = await web3.eth.getBlock("latest")
      let blockTime = block.timestamp
      let time = new Date(blockTime)
      time.setMinutes(time.getMinutes() + 6)
      time = +time
      await assertRevert(
        vesting.addVesting(accounts[1], "" + time, amount, {
          from: accounts[1]
        })
      )
    })
    it("should test token vesting for amount greater then balance of vesting contract", async function() {
      const amount = toWei((10 ** 10).toString())
      let block = await web3.eth.getBlock("latest")
      let blockTime = block.timestamp
      let time = new Date(blockTime)
      time.setMinutes(time.getMinutes() + 1)
      time = +time
      let result = await vesting.addVesting(
        accounts[1],
        time.toString(),
        amount,
        {
          from: accounts[0]
        }
      )
      // Time travel
      let seconds = 60 * 1000
      await increaseBlockTime(seconds)
      await mineOneBlock()

      //Insufficient balance
      await assertRevert(
        vesting.release(result.receipt.logs[0].args.vestingId),
        "Insufficient balance"
      )
      await vesting.removeVesting(result.receipt.logs[0].args.vestingId, {
        from: owner
      })
    })

    it("Trying to release the tokens associated with existing vesting entry", async function() {
      let amount = await token.balanceOf(vesting.address)
      await assertRevert(vesting.retrieveExcessTokens(amount, { from: owner }))
    })
  })
})
