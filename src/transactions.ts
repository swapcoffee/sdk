import { ApiTransactionsResult, RoutingApi } from './api';


/**
 * Wait for transaction result by query_id
 * 
 * @param query_id - query_id of transaction from {@link ApiSwapTransaction}
 * @param api - instance of {@link RoutingApi}
 * @param period - period of time to wait for result (default 1000 ms)
 */
export async function waitForTransactionResult(query_id: number, api: RoutingApi, period: number = 1000): Promise<ApiTransactionsResult> {
  let result = await api.getTransactionsResult(query_id);

  return new Promise(async (resolve, reject) => {
    while (result.data.in_progress) {
      await new Promise(r => setTimeout(r, period));
      result = await api.getTransactionsResult(query_id);
    }

    resolve(result.data);
  });
}

