import { EthereumData, EthereumService } from '../types';
export declare class EthereumServiceImpl implements EthereumService {
    private provider;
    constructor(rpcUrl?: string);
    getCurrentGasPrice(): Promise<string>;
    getCurrentBlockNumber(): Promise<number>;
    getBalance(address: string): Promise<string>;
    getEthereumData(address: string): Promise<EthereumData>;
}
//# sourceMappingURL=ethereumService.d.ts.map