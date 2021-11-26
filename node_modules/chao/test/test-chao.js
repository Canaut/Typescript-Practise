'use strict'
/* eslint-env mocha */
const expect = require('chai').expect
const Chao = require('../chao')

String.prototype.shuffle = function (str) { // eslint-disable-line no-extend-native
  return this.split('').sort(function () { return 0.5 - Math.random() }).join('')
}

describe('Chaocipher', function () {
  before(function () {
    const plaintextAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const ciphertextAlphabet = 'HXUCZVAMDSLKPEFJRIGTWOBNYQ'
    this.cipher = new Chao(ciphertextAlphabet, plaintextAlphabet)
  })

  it('encodes properly', function () {
    expect(this.cipher.encode('WELLDONEISBETTERTHANWELLSAID')).to.equal('BCNSQWDBQSVODMGXUHFSBRWTMMTE')
  })

  it('decodes properly', function () {
    expect(this.cipher.decode('BCNSQWDBQSVODMGXUHFSBRWTMMTE')).to.equal('WELLDONEISBETTERTHANWELLSAID')
  })

  it('is reversible', function () {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const ciphertextAlphabet = possible.shuffle()
    const plaintextAlphabet = possible.shuffle()
    const cipher = new Chao(ciphertextAlphabet, plaintextAlphabet)
    const str = possible.shuffle()
    const crypted = cipher.encode(str)
    expect(crypted).to.not.equal(str)
    expect(cipher.decode(crypted)).to.equal(str)
  })

  it("doesn't touch characters not in the plaintext alphabet", function () {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const ciphertextAlphabet = possible.shuffle()
    const plaintextAlphabet = possible.shuffle()
    const cipher = new Chao(ciphertextAlphabet, plaintextAlphabet)
    const str = 'This is my text!'
    const crypted = cipher.encode(str)
    expect(crypted).to.not.equal(str)
    expect(crypted).to.match(/[A-Za-z0-9]{4} [A-Za-z0-9]{2} [A-Za-z0-9]{2} [A-Za-z0-9]{4}!/)
    expect(cipher.decode(crypted)).to.equal(str)
  })
})
