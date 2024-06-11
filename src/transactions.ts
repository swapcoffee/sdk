import { ApiTransactionResult, RoutingApi } from './api';


/**
 * Wait for transaction result by route id
 *
 * @param routeId - route id
 * @param api - instance of {@link RoutingApi}
 * @param period - period of time to wait for result (default 1000 ms)
 */
export async function waitForTransactionResults(routeId: number, api: RoutingApi, period: number = 10_000): Promise<ApiTransactionResult[]> {
  let result = await api.getTransactionsResult(routeId);

  return new Promise(async (resolve, reject) => {

    while (!allTransactionsCompleted(result.data)) {
      await new Promise(resolve => setTimeout(resolve, period));
      result = await api.getTransactionsResult(routeId);
    }

    resolve(result.data);
  });
}


function allTransactionsCompleted(transactions: ApiTransactionResult[]): boolean {
  return transactions.every(transaction => transaction.status != 'pending' && transaction.status != 'partially_complete');
}

