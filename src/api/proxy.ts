import { RPCResponse, SettingsFormState } from '@/api/models';
import Web3 from 'web3';

export class NeonProxy {
  neonProxyRpcApi = '';
  solanaRpcApi = '';
  web3: Web3;

  async rpc<T>(url: string, method: string, params: unknown[] = []): Promise<RPCResponse<T>> {
    const id = Date.now();
    const body = { id, jsonrpc: '2.0', method, params };
    const request = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(body)
    });
    return await request.json();
  }

  async proxy<T>(method: string, params: unknown[] = []): Promise<RPCResponse<T>> {
    return this.rpc<T>(this.neonProxyRpcApi, method, params);
  }

  async solana<T>(method: string, params: unknown[] = []): Promise<RPCResponse<T>> {
    return this.rpc<T>(this.solanaRpcApi, method, params);
  }

  async neonEmulate(params: string[] = []): Promise<RPCResponse<any>> {
    return this.proxy<any>('neon_emulate', params).then(d => d.result);
  }

  constructor(params: SettingsFormState) {
    this.neonProxyRpcApi = params.neonProxyRpcApi ?? '';
    this.solanaRpcApi = params.solanaRpcApi ?? '';
    const web3Provider = new Web3.providers.HttpProvider(this.neonProxyRpcApi);
    this.web3 = new Web3(web3Provider);
  }
}
