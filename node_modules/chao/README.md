# Chao

A Javascript implementation of the [Chaocipher](https://en.wikipedia.org/wiki/Chaocipher).

## How it works

[Chaocipher](https://en.wikipedia.org/wiki/Chaocipher) was discovered
by John F. Byrne, an associate of James Joyce, in 1918. It's a type of
[dynamic substitution cipher](http://www.ciphersbyritter.com/DYNSUB.HTM)
where the starting input and output alphabet are scrambled after each
step. While difficult to decrypt by hand, it's known to have been
broken by known plaintext attack.

The "key" for this algorithm is the initial input and output
alphabets.  Each alphabet should contain a permutation of the all the
characters that you want in your input and output. Any characters not
in the alphabet will be left alone.

To install:

    npm install chao

Usage example:

```javascript
const Chaocipher = require('chao')
const assert = require('assert')

const plaintextAlphabet = 'df6nCwtk0F7NoQ4prO1aR5Hcq3xJSMiYB9eVWTL8XAslEzuhmUbygIvKPZDG2j'
const ciphertextAlphabet = 'CLMYN3KWOX6bPEQRgqtn0J4IruH5Bcfv9jkGhm1ZSzyA78iUFwT2slpDaVxedo'

const chao = new Chaocipher(plaintextAlphabet, ciphertextAlphabet)

const input = 'Something very important!'
const ciphertext = chao.encode(input)
assert.equal(ciphertext, 'X2VP4Y8oF qUNj MqsQlBCdf!')
const recoveredtext = chao.decode(ciphertext)
assert.equal(recoveredtext, input)
```

The code is largely based on https://github.com/aprescott/chaocipher
