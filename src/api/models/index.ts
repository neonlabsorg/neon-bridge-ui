export interface RPCResponse<T> {
  id: number | string;
  jsonrpc: string;
  result: T;
}

export interface SettingsFormState {
  solanaRpcApi: string;
  neonProxyRpcApi: string;
}
