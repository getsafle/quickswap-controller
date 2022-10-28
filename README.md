# quickswap-dex-controller

This SDK houses the functions to interact with the Quickswap Contracts.

## Installation

To install this SDK,

```sh
npm install --save @getsafle/quickswap-controller
```

## Initialization

Initialize the constructor,

```js
const Quickswap = require('@getsafle/quickswap-controller');

const controller = new Quickswap(chain);
```

<br>

> Get supported tokens

This function will give us the list of all tokens supported by Quickswap.

```js
await controller.getSupportedTokens()
```

<br>

> Get Exchange Rate

<br>

This will give us the exchange rate of 2 tokens.
Amount of `fromContractAddress` the user will receive for `fromQuantity` of `toContractAddress`.

```js
await controller.getExchangeRate({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance, walletAddress })
```

<br>

> Get Estimated gas

<br>

This will give us the estimated amount of gas needed to do the swap.

```js
await controller.getEstimatedGas({ toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, fromQuantity, slippageTolerance, walletAddress })
```

<br>

> Get Raw Transaction

<br>

This will give us the raw transaction to swap the tokens on quickswap.

```js
await controller.getRawTransaction({ walletAddress, toContractAddress, toContractDecimal, fromContractAddress, fromContractDecimal, toQuantity, fromQuantity, slippageTolerance })
```

<br>

> Get Approval Transaction

<br>

This function will call the approval smart contract function to approve spending `fromQuantity` for the `fromContractAddress` from the `walletAddress`.

```js
await controller.approvalRawTransaction({ fromContractAddress, walletAddress, fromQuantity })
```
