const csv = require('csv-parser')
const fs = require('fs')
const assert = require('assert')

function parseCsv(web3) {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream('Rewards.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const totalTokensForEachUser = {}
        let airdropSupply = 0
        results.forEach(r => {
          let recipient = r.deposit_address.trim().toLowerCase()
          if (recipient.length == 42) {
            if (!totalTokensForEachUser[recipient]) totalTokensForEachUser[recipient] = 0
            let amount = parseInt(r.num_tokens.trim())
            totalTokensForEachUser[recipient] += amount
            airdropSupply += amount
          } else {
            console.log(r)
          }
        })

        const recipients = []
        const amounts = []
        Object.keys(totalTokensForEachUser).forEach(recipient => {
          recipients.push(recipient)
          amounts.push(web3.utils.toBN(totalTokensForEachUser[recipient]))
        })
        // validations
        console.log('recipients.length', recipients.length, 'airdropSupply', airdropSupply.toString())
        assert.equal(recipients.length, amounts.length)
        assert.equal(recipients.length, (new Set(recipients)).size)

        resolve({ recipients, amounts, airdropSupply });
      });
  })
}

// parseCsv().then()
module.exports = { parseCsv }
