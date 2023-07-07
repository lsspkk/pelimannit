const bcrypt = require('./node_modules/bcrypt/bcrypt.js')

const command = process.argv[2]
const word = process.argv[3]
const oldhash = process.argv[4]

console.debug({ command, word, oldhash })
if (command === 'make') {
  const hash = bcrypt.hashSync(word, 8)
  console.log(hash)
} else if (command === 'compare') {
  const result = bcrypt.compareSync(word, oldhash)
  console.log(result)
}
