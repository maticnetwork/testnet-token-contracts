const Token = artifacts.require("MaticToken")

async function fireTx() {
  const t = await Token.at(process.argv[4])
  const r = await t.transfer(
    process.argv[5],
    web3.utils.toBN(process.argv[6]).mul(web3.utils.toBN(10 ** 18))
  )
  console.log(r)
}

module.exports = async function(callback) {
  // perform actions
  try {
    const tx = await fireTx();
    callback();
  } catch (e) {
    console.log(e)
  }
}
