import {
  codec, // Codec with XRP alphabet
  encodeSeed, // Encode entropy as a "seed"
  decodeSeed, // Decode a seed into an object with its version, type, and bytes
  encodeAccountID, // Encode bytes as a classic address (r...)
  decodeAccountID, // Decode a classic address to its raw bytes
  encodeNodePublic, // Encode bytes to XRP Ledger node public key format
  decodeNodePublic, // Decode an XRP Ledger node public key into its raw bytes
  isValidAddress // Check whether a classic address (r...) is valid
} from './xrp-codec'

const prefixBytes = Buffer.from([0x05, 0x44])

function encodeXAddress(classicAddress: string, tag?: number | undefined): string {
  const MAX_32_BIT_UNSIGNED_INT = 4294967295
  const flag = tag === undefined ? 0 : tag <= MAX_32_BIT_UNSIGNED_INT ? 1 : 2
  if (flag === 2) {
    throw new Error('Invalid tag')
  }

  const accountId = decodeAccountID(classicAddress)
  if (tag === undefined) {
    tag = 0
  }
  const bytes = Buffer.concat(
    [
      prefixBytes,
      accountId,
      Buffer.from(
        [
          flag, // 0x00 if no tag, 0x01 if 32-bit tag
          tag & 0xff, // first byte
          (tag >> 8) & 0xff, // second byte
          (tag >> 16) & 0xff, // third byte
          (tag >> 24) & 0xff, // fourth byte
          0, 0, 0, 0 // four zero bytes (reserved for 64-bit tags)
        ]
      )
    ]
  )
  const xAddress = codec.encodeChecked(bytes)
  return xAddress
}

function decodeXAddress(xAddress: string): {classicAddress: string, tag?: number} {
  const decoded = codec.decodeChecked(xAddress)
  if (!prefixBytes.equals(decoded.slice(0, 2))) {
    throw new Error('Invalid X-address: bad prefix')
  }
  const classicAddress = encodeAccountID(decoded.slice(2, 22))
  const flag = decoded[22]
  if (flag === 0) {
    return {classicAddress}
  }
  if (flag >= 2) {
    throw new Error('Unsupported X-address')
  }

  // Little-endian to big-endian
  const tag = decoded[23] + decoded[24] * 0x100 + decoded[25] * 0x10000 + decoded[26] * 0x1000000

  return {
    classicAddress,
    tag
  }
}

function isValidXAddress(xAddress: string): boolean {
  try {
    decodeXAddress(xAddress)
  } catch (e) {
    return false
  }
  return true
}

export {
  codec, // Codec with XRP alphabet
  encodeSeed, // Encode entropy as a "seed"
  decodeSeed, // Decode a seed into an object with its version, type, and bytes
  encodeAccountID, // Encode bytes as a classic address (r...)
  decodeAccountID, // Decode a classic address to its raw bytes
  encodeNodePublic, // Encode bytes to XRP Ledger node public key format
  decodeNodePublic, // Decode an XRP Ledger node public key into its raw bytes
  isValidAddress, // Check whether a classic address (r...) is valid
  encodeXAddress, // Encode classic address and optional tag to X-address
  decodeXAddress, // Decode X-address to classic address and optional tag
  isValidXAddress // Check whether an X-address (X...) is valid
}
