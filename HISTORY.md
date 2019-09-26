# ripple-address-codec Release History

## 4.0.0 (UNRELEASED)

### Breaking Changes

* `decodeAddress` has been renamed to `decodeAccountID`

### New Features

* `classicAddressToXAddress` - Derive X-address from classic address, tag, and network ID
* `encodeXAddress` - Encode account ID, tag, and network ID to X-address
* `xAddressToClassicAddress` - Decode X-address to account ID, tag, and network ID
* `decodeXAddress` - Convert X-address to classic address, tag, and network ID
* `isValidXAddress` - Check whether an X-address (X...) is valid
