import { ApiSplitResult, RoutingApi } from './api';


/**
 * Wait for transaction result by route id
 *
 * @param routeId - route id
 * @param api - instance of {@link RoutingApi}
 * @param period - period of time to wait for result (default 1000 ms)
 */
export async function waitForRouteResults(routeId: number, api: RoutingApi, period: number = 10_000): Promise<ApiSplitResult[]> {
  let result = await api.getRouteResult(routeId);

  return new Promise(async (resolve, reject) => {

    while (!allSplitsCompleted(result.data.splits)) {
      await new Promise(resolve => setTimeout(resolve, period));
      result = await api.getRouteResult(routeId);
    }

    resolve(result.data.splits);
  });
}


function allSplitsCompleted(transactions: ApiSplitResult[]): boolean {
  return transactions.every(transaction => transaction.status != 'pending' && transaction.status != 'partially_complete');
}

