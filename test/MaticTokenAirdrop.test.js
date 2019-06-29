const crypto = require('crypto')
const bluebird = require('bluebird')
const abiDecoder = require('abi-decoder')
const parseCsv = require('./utils').parseCsv

const Token = artifacts.require("./contracts/MaticToken.sol")
const Airdrop = artifacts.require("./contracts/MaticTokenAirdrop.sol")
const BigNumber = web3.utils.BigNumber

abiDecoder.addABI(Token._json.abi);

require("chai")
  .use(require("chai-bignumber")(BigNumber))
  .should()

contract.only("MaticTokenAirdrop", async function(accounts) {
  const SCALING_FACTOR = web3.utils.toBN(10 ** 18)
  let owner = accounts[0]
  let token
  let airdrop
  let totalSupply = web3.utils.toBN(10 ** 10).mul(SCALING_FACTOR)

  beforeEach(async function() {
    token = await Token.new("Matic test", "MATIC", 18, totalSupply, {from: owner})
    airdrop = await Airdrop.new(token.address, { from: owner })
  })

  it("should airdrop from test data", async function() {
    const NUM_RECIPIENTS = 200
    let { recipients, amounts, airdropSupply } = buildTestData(NUM_RECIPIENTS)
    // console.log(recipients, amounts, airdropSupply.toString())
    airdropSupply = web3.utils.toBN(airdropSupply).mul(SCALING_FACTOR)

    // transfer tokens to the contract for airdrop
    await token.transfer(airdrop.address, airdropSupply, { from: owner })
    let airdropContractBalance = await token.balanceOf.call(airdrop.address)
    assert.ok(airdropContractBalance.eq(airdropSupply), 'airdropSupply assertion failed')

    // assert initial user balances are 0
    await bluebird.map(recipients, async recipient => {
      let balance = await token.balanceOf.call(recipient)
      assert.equal(balance.toString(), '0')
    })

    const tx = await airdrop.airdropTokens(recipients, amounts)
    const decodedLogs = abiDecoder.decodeLogs(tx.receipt.rawLogs);
    assert.equal(decodedLogs.length, NUM_RECIPIENTS)

    // check balances and emitted events
    for(let i = 0; i < NUM_RECIPIENTS; i++) {
      assert.equal(decodedLogs[i].name, 'Transfer')
      assert.equal(decodedLogs[i].address.toLowerCase(), token.address.toLowerCase()) // contract
      assert.equal(decodedLogs[i].events[0].value.toLowerCase(), airdrop.address.toLowerCase()) // from
      assert.equal(decodedLogs[i].events[1].value.toLowerCase(), recipients[i].toLowerCase()) // to
      assert.equal(decodedLogs[i].events[2].value, amounts[i].mul(SCALING_FACTOR).toString()) // value

      let balance = await token.balanceOf.call(recipients[i])
      assert.ok(balance.eq(amounts[i].mul(SCALING_FACTOR)), 'Balance assertion failed')
    }
    airdropContractBalance = await token.balanceOf.call(airdrop.address)
    assert.ok(airdropContractBalance.eq(web3.utils.toBN(0)), 'did not exhaust all tokens')

    console.log('gasUsed', tx.receipt.gasUsed)
  })

  it("should airdrop from csv", async function() {
    let { recipients, amounts, airdropSupply } = await parseCsv()
    let NUM_RECIPIENTS = recipients.length
    // console.log({ recipients, amounts, airdropSupply: airdropSupply.toString() })
    airdropSupply = web3.utils.toBN(airdropSupply).mul(SCALING_FACTOR)

    // transfer tokens to the contract for airdrop
    await token.transfer(airdrop.address, airdropSupply, { from: owner })
    let airdropContractBalance = await token.balanceOf.call(airdrop.address)
    assert.ok(airdropContractBalance.eq(airdropSupply), 'airdropSupply assertion failed')

    // assert initial user balances are 0
    await bluebird.map(recipients, async recipient => {
      let balance = await token.balanceOf.call(recipient)
      assert.equal(balance.toString(), '0')
    })

    const tx = await airdrop.airdropTokens(recipients, amounts)
    const decodedLogs = abiDecoder.decodeLogs(tx.receipt.rawLogs);
    assert.equal(decodedLogs.length, NUM_RECIPIENTS)

    // check balances and emitted events
    for(let i = 0; i < NUM_RECIPIENTS; i++) {
      assert.equal(decodedLogs[i].name, 'Transfer')
      assert.equal(decodedLogs[i].address.toLowerCase(), token.address.toLowerCase()) // contract
      assert.equal(decodedLogs[i].events[0].value.toLowerCase(), airdrop.address.toLowerCase()) // from
      assert.equal(decodedLogs[i].events[1].value.toLowerCase(), recipients[i].toLowerCase()) // to
      assert.equal(decodedLogs[i].events[2].value, amounts[i].mul(SCALING_FACTOR).toString()) // value

      let balance = await token.balanceOf.call(recipients[i])
      assert.ok(balance.eq(amounts[i].mul(SCALING_FACTOR)), 'Balance assertion failed')
    }
    airdropContractBalance = await token.balanceOf.call(airdrop.address)
    assert.ok(airdropContractBalance.eq(web3.utils.toBN(0)), 'did not exhaust all tokens')

    console.log('gasUsed', tx.receipt.gasUsed)
  })

  it('onlyOwner can call airdropTokens', async function() {
    assert.equal((await airdrop.owner()).toLowerCase(), owner.toLowerCase())
    let { recipients, amounts, airdropSupply } = buildTestData(5)
    airdropSupply = web3.utils.toBN(airdropSupply).mul(SCALING_FACTOR)
    await token.transfer(airdrop.address, airdropSupply, { from: owner })

    try {
      await airdrop.airdropTokens(recipients, amounts, {from: accounts[1]})
      assert.fail('should have failed')
    } catch(e) {
      // expected
    }
  })
})

function buildTestData(n) {
  const recipients = []
  const amounts = []
  let airdropSupply = web3.utils.toBN(0)
  for(let i = 0; i < n; i++) {
    recipients.push('0x' + crypto.randomBytes(20).toString('hex'))
    let amount = web3.utils.toBN(getRandomInt(100))
    airdropSupply = airdropSupply.add(amount)
    amounts.push(amount)
  }
  return { recipients, amounts, airdropSupply }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
