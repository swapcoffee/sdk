<p align="center">
  <a href="https://swap.coffee" target="blank"><img src="https://avatars.githubusercontent.com/u/171727895?s=400&u=f6a9b30455abed8c09dc7d4e6108eb21d0715ade&v=4" width="130" alt="swap.coffee logo" /></a>
</p>

<p align="center">SDK for swap.coffee DEX aggregator</p>

<p align="center">
<a href="https://www.npmjs.com/package/@swap-coffee/sdk"><img alt="npm" src="https://img.shields.io/npm/v/%40swap-coffee%2Fsdk?labelColor=%23fffff&color=%233e1c00"></a>
<a href="https://opensource.org/licenses/mit"><img alt="License" src="https://img.shields.io/badge/license-MIT-blue"></a>
<a href="https://docs.swap.coffee"><img alt="documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen"></a>
</p>

## Installation

```bash
npm install @swap-coffee/sdk
```

Documentation can be found [here](https://docs.swap.coffee).


## Basic usage

Swapping assets using our SDK and [TonConnect SDK](https://www.npmjs.com/package/@tonconnect/sdk)

```typescript
const connector = await setupTonConnect();
const routingApi = new RoutingApi();

const assetIn: ApiTokenAddress = {
  blockchain: 'ton',
  address: 'native', // stands for TON
};
const assetOut: ApiTokenAddress = {
  blockchain: 'ton',
  address: 'EQCl0S4xvoeGeFGijTzicSA8j6GiiugmJW5zxQbZTUntre-1', // CES
};

const input_amount = 5; // 5 TON

const route = await routingApi.buildRoute({
  input_token: assetIn,
  output_token: assetOut,
  output_amount: 200, // desired amount of output token
});

const transactions = await routingApi.buildTransactionsV2({
  sender_address: connector.account?.address!!,
  slippage: 0.1,
  paths: route.data.paths, // note: use route.data here
});


let messages = [];

for (const transaction of transactions.data.transactions) {
  messages.push({
    address: transaction.address,
    amount: transaction.value,
    payload: transaction.cell,
  });
}

await connector.sendTransaction({
  validUntil: Date.now() + 5 * 60 * 1000,
  messages: messages,
});

const results = await waitForTransactionResults(transactions.data.route_id, routingApi);
```
And here is our transaction:

![img.png](assets/img.png)

Full example code can be found [here](examples/swap.ts)

## License

swap.coffee SDK is [MIT licensed](LICENSE).

## Copyright

swap.coffee &copy; 2024