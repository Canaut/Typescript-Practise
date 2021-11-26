'use strict'

String.prototype.rotate = function (rotateAmount) { // eslint-disable-line no-extend-native
  return this.slice(rotateAmount) + this.slice(0, rotateAmount)
}

class Alphabet {
  constructor (characters) {
    this.data = characters
    this.nadirIndex = Math.floor(characters.length / 2)
  }

  permute (newZenith, skipAmount) {
    let permutedCharacters = this.data.rotate(this.data.indexOf(newZenith))
    if (skipAmount === 2) permutedCharacters = permutedCharacters.rotate(1)
    this.data = permutedCharacters.slice(0, skipAmount) +
      permutedCharacters.slice(skipAmount, this.nadirIndex + 1).rotate(1) +
      permutedCharacters.slice(this.nadirIndex + 1)
  }
}

module.exports = class Chao {
  constructor (ciphertextAlphabet, plaintextAlphabet) {
    this.reinitialize = function () {
      this.alphabets = [new Alphabet(ciphertextAlphabet), new Alphabet(plaintextAlphabet)]
    }
  }

  process (text, select) {
    this.reinitialize()
    return text.split('').map(c => {
      const lastConvertedLetter = this.alphabets[select].data.charAt(this.alphabets[1 - select].data.indexOf(c))
      // Only convert characters in the source alphabet.
      if (lastConvertedLetter === '') return c
      this.alphabets[select].permute(lastConvertedLetter, 1 + select)
      this.alphabets[1 - select].permute(c, 2 - select)
      return lastConvertedLetter
    }).join('')
  }

  encode (text) {
    return this.process(text, 0)
  }

  decode (text) {
    return this.process(text, 1)
  }
}
