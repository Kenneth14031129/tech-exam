export interface EthereumData {
  gasPrice: string;
  currentBlockNumber: number;
  balance: string;
  address: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface EthereumService {
  getCurrentGasPrice(): Promise<string>;
  getCurrentBlockNumber(): Promise<number>;
  getBalance(address: string): Promise<string>;
  getEthereumData(address: string): Promise<EthereumData>;
}