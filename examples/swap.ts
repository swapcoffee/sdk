import { FSStorage, TonConnectStorage } from './storage';
import TonConnect, { WalletInfo, WalletInfoRemote } from '@tonconnect/sdk';
import { ApiTokenAddress, RoutingApi, waitForRouteResults } from '../src';

function isRemote(walletInfo: WalletInfo): walletInfo is WalletInfoRemote {
  return 'universalLink' in walletInfo && 'bridgeUrl' in walletInfo;
}

export async function setupTonConnect(): Promise<TonConnect> {
  const connector = new TonConnect({
    storage: new TonConnectStorage(new FSStorage('tonconnect.json')),
    manifestUrl: 'https://raw.githubusercontent.com/ton-org/blueprint/main/tonconnect/manifest.json',
  });

  const wallets = (await connector.getWallets()).filter(isRemote);

  const wallet = wallets.find(wallet => wallet.name === 'Tonkeeper') as WalletInfoRemote;

  const url = connector.connect({
    universalLink: wallet.universalLink,
    bridgeUrl: wallet.bridgeUrl,
  }) as string;


  console.log(url);

  return new Promise((resolve, reject) => {
    connector.onStatusChange((w) => {
      if (w) {
        resolve(connector);
      } else {
        reject('Wallet is not connected');
      }
    }, reject);
  });
}


export async function swapAssets() {
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

  console.log(route.data);

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

  const results = await waitForRouteResults(transactions.data.route_id, routingApi);

  console.log(results); // array of transaction results
}

swapAssets();