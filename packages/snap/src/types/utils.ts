export enum BroadcastMode {
  // zero-value for mode ordering
  BROADCAST_MODE_UNSPECIFIED = 0,
  // BROADCAST_MODE_BLOCK defines a tx broadcasting mode where the client waits for
  // the tx to be committed in a block.
  BROADCAST_MODE_BLOCK = 1,
  // BROADCAST_MODE_SYNC defines a tx broadcasting mode where the client waits for
  // a CheckTx execution response only.
  BROADCAST_MODE_SYNC = 2,
  // BROADCAST_MODE_ASYNC defines a tx broadcasting mode where the client returns
  // immediately.
  BROADCAST_MODE_ASYNC = 3,
}