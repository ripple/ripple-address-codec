/* eslint-disable no-unused-expressions/no-unused-expressions */

'use strict'

const assert = require('assert')
const api = require('../')

function toHex(bytes) {
  return new Buffer(bytes).toString('hex').toUpperCase()
}

function toBytes(hex) {
  return new Buffer(hex, 'hex').toJSON().data
}

function UInt32LE_ToUInt32(hex) {
  return Buffer.from(hex, 'hex').readUInt32LE()
}

function UInt32_ToUInt32LE(int) {
  const buf = Buffer(8)
  buf.writeUInt32LE(int, 0)
  return buf.toString('hex').toUpperCase()
}

describe('ripple-address-codec', function() {
  function makeTest(type, base58, hex) {
    it('can translate between ' + hex + ' and ' + base58, function() {
      const actual = api['encode' + type](toBytes(hex))
      assert.equal(actual, base58)
    })
    it('can translate between ' + base58 + ' and ' + hex, function() {
      const buf = api['decode' + type](base58)
      assert.equal(toHex(buf), hex)
    })
  }

  makeTest('AccountID', 'rJrRMgiRgrU6hDF4pgu5DXQdWyPbY35ErN',
    'BA8E78626EE42C41B46D46C3048DF3A1C3C87072')

  makeTest(
    'NodePublic',
    'n9MXXueo837zYH36DvMc13BwHcqtfAWNJY5czWVbp7uYTj7x17TH',
    '0388E5BA87A000CB807240DF8C848EB0B5FFA5C8E5A521BC8E105C0F0A44217828')

  makeTest('K256Seed', 'sn259rEFXrQrWyx3Q7XneWcwV6dfL',
    'CF2DE378FBDD7E2EE87D486DFB5A7BFF')

  makeTest('EdSeed', 'sEdTM1uX8pu2do5XvTnutH6HsouMaM2',
    '4C3A1D213FBDFB14C7C28D609469B341')

  it('can decode arbitray seeds', function() {
    const decoded = api.decodeSeed('sEdTM1uX8pu2do5XvTnutH6HsouMaM2')
    assert.equal(toHex(decoded.bytes), '4C3A1D213FBDFB14C7C28D609469B341')
    assert.equal(decoded.type, 'ed25519')

    const decoded2 = api.decodeSeed('sn259rEFXrQrWyx3Q7XneWcwV6dfL')
    assert.equal(toHex(decoded2.bytes), 'CF2DE378FBDD7E2EE87D486DFB5A7BFF')
    assert.equal(decoded2.type, 'secp256k1')
  })

  it('can pass a type as second arg to encodeSeed', function() {
    const edSeed = 'sEdTM1uX8pu2do5XvTnutH6HsouMaM2'
    const decoded = api.decodeSeed(edSeed)
    assert.equal(toHex(decoded.bytes), '4C3A1D213FBDFB14C7C28D609469B341')
    assert.equal(decoded.type, 'ed25519')
    assert.equal(api.encodeSeed(decoded.bytes, decoded.type), edSeed)
  })

  it('can decode a tagged address (XLS-5d) to AccountID and tag', function() {
    const tagged = 'r1WTvVjuoBM9vsm2p395AyzCQcJyE9CCWEMvo5U5sP5Px5'
    const decodedHex = toHex(api.decodeTaggedAddress(tagged))
    assert.equal(api.encodeAccountID(toBytes(decodedHex.slice(0, -18))), 'rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf')
    assert.equal(decodedHex.slice(-18, -16), '01')
    assert.equal(UInt32LE_ToUInt32(decodedHex.slice(-16)), 16781933)
  })
  it('can encode an AccountID without tag to a tagged address (XLS-5d)', function() {
    const account = 'rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf'
    const decoded = toHex(api.decodeAccountID(account))
    assert.equal(api.encodeTaggedAddress(toBytes(decoded + '00' + UInt32_ToUInt32LE(0))), 'r1WTvVjuoBM9vsm2p395AyzCQcJyEp8aG4YHcqE3XLDehK')
  })
  it('can encode an AccountID and tag to a tagged address (XLS-5d)', function() {
    const account = 'rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf'
    const tag = 4294967294
    const decoded = toHex(api.decodeAccountID(account))
    assert.equal(api.encodeTaggedAddress(toBytes(decoded + '01' + UInt32_ToUInt32LE(tag))), 'r1WTvVjuoBM9vsm2p395AyzCQcJyEURPMMjRhJoyxQhdt5')
  })

  it('isValidAddress - secp256k1 address valid', function() {
    assert(api.isValidAddress('rU6K7V3Po4snVhBBaU29sesqs2qTQJWDw1'))
  })
  it('isValidAddress - ed25519 address valid', function() {
    assert(api.isValidAddress('rLUEXYuLiQptky37CqLcm9USQpPiz5rkpD'))
  })
  it('isValidAddress - invalid', function() {
    assert(!api.isValidAddress('rU6K7V3Po4snVhBBaU29sesqs2qTQJWDw2'))
  })
  it('isValidAddress - empty', function() {
    assert(!api.isValidAddress(''))
  })
  it('isValidTaggedAddress - secp256k1 tagged address valid', function() {
    assert(api.isValidTaggedAddress('r1WTvVjuoBM9vsm2p395AyzCQcJyE3eVsfqQrBa3X4q4qF'))
  })
  it('isValidTaggedAddress - invalid for untagged', function() {
    assert(!api.isValidTaggedAddress('rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf'))
  })

})
