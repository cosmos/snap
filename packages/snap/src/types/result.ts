/**
 * Result is the type returned on the Metamask RPC request.
 */
export interface Result {
  data: object;
  success: Boolean;
  statusCode: number;
}
