import {
  encodeXAddress, // Encode classic address and optional tag to X-address
  decodeXAddress, // Decode X-address to classic address and optional tag
  isValidXAddress // Check whether an X-address (X...) is valid
} from './index'

const testCases = [
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', false,   'XVLhHMPHU98es4dbozjVtdWzVrDjtV5fdx1mHp98tDMoQXb'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 0,   'XVLhHMPHU98es4dbozjVtdWzVrDjtV8AqEL4xcZj5whKbmc'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 1,   'XVLhHMPHU98es4dbozjVtdWzVrDjtV8xvjGQTYPiAx6gwDC'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 2,   'XVLhHMPHU98es4dbozjVtdWzVrDjtV8zpDURx7DzBCkrQE7'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 32,  'XVLhHMPHU98es4dbozjVtdWzVrDjtVoYiC9UvKfjKar4LJe'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 276, 'XVLhHMPHU98es4dbozjVtdWzVrDjtVoKj3MnFGMXEFMnvJV'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 65591,   'XVLhHMPHU98es4dbozjVtdWzVrDjtVozpjdhPQVdt3ghaWw'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 16781933,    'XVLhHMPHU98es4dbozjVtdWzVrDjtVqrDUk2vDpkTjPsY73'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 4294967294,  'XVLhHMPHU98es4dbozjVtdWzVrDjtV1kAsixQTdMjbWi39u'],
  ['rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf', 4294967295,  'XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8yuPT7y4xaEHi'],
  ['rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', false,  'XV5sbjUmgPpvXv4ixFWZ5ptAYZ6PD2gYsjNFQLKYW33DzBm'],
  ['rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', 0,  'XV5sbjUmgPpvXv4ixFWZ5ptAYZ6PD2m4Er6SnvjVLpMWPjR'],
  ['rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', 13371337,  'XV5sbjUmgPpvXv4ixFWZ5ptAYZ6PD2qwGkhgc48zzcx6Gkr']
]

for (const i in testCases) {
  const testCase = testCases[i]
  const classicAddress = testCase[0] as string
  const tag = testCase[1] !== false ? testCase[1] as number : undefined
  const xAddress = testCase[2] as string
  test(`Converts ${classicAddress}:${testCase[1] ? testCase[1] : ''} to ${testCase[2]}`, () => {
    const myXAddress = encodeXAddress(classicAddress, tag)
    expect(myXAddress).toBe(xAddress)
    const myClassicAddress = decodeXAddress(xAddress)
    expect(myClassicAddress).toEqual({
      classicAddress,
      tag
    })
    expect(isValidXAddress(xAddress)).toBe(true)
  })
}

{
  const MAX_32_BIT_UNSIGNED_INT = 4294967295

  const classicAddress = 'rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf'
  const tag = MAX_32_BIT_UNSIGNED_INT + 1

  test(`Converting ${classicAddress}:${tag} throws`, () => {
    expect(() => {
      encodeXAddress(classicAddress, tag)
    }).toThrowError(new Error('Invalid tag'))
  })
}

{
  const classicAddress = 'r'
  test(`Invalid classic address: Converting ${classicAddress} throws`, () => {
    expect(() => {
      encodeXAddress(classicAddress)
    }).toThrowError(new Error('invalid_input_size: decoded data must have length >= 5'))
  })
}

{
  const xAddress = 'XVLhHMPHU98es4dbozjVtdWzVrDjtV5fdx1mHp98tDMoQXa'
  test(`Invalid X-address (bad checksum): Converting ${xAddress} throws`, () => {
    expect(() => {
      decodeXAddress(xAddress)
    }).toThrowError(new Error('checksum_invalid'))
  })
}

{
  const xAddress = 'dGzKGt8CVpWoa8aWL1k18tAdy9Won3PxynvbbpkAqp3V47g'
  test(`Invalid X-address (bad prefix): Converting ${xAddress} throws`, () => {
    expect(() => {
      decodeXAddress(xAddress)
    }).toThrowError(new Error('Invalid X-address: bad prefix'))
  })
}

test(`Invalid X-address (64-bit tag) throws`, () => {
  expect(() => {
    // Encoded from:
    // {
    //   classicAddress: 'rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf',
    //   tag: MAX_32_BIT_UNSIGNED_INT + 1
    // }
    decodeXAddress('XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8zeUygYrCgrPh')
  }).toThrowError('Unsupported X-address')
})

test(`isValidXAddress returns false for invalid X-address`, () => {
  expect(isValidXAddress('XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8zeUygYrCgrPh')).toBe(false)
})
