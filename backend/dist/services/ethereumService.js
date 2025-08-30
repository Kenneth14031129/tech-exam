"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumServiceImpl = void 0;
const ethers_1 = require("ethers");
class EthereumServiceImpl {
    constructor(rpcUrl = 'https://eth-mainnet.g.alchemy.com/v2/demo') {
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    }
    async getCurrentGasPrice() {
        try {
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice;
            if (!gasPrice) {
                throw new Error('Unable to fetch gas price');
            }
            const gasPriceGwei = ethers_1.ethers.formatUnits(gasPrice, 'gwei');
            console.log('🌐 Gas price fetched from network');
            return gasPriceGwei;
        }
        catch (error) {
            console.error('Error fetching gas price:', error);
            throw new Error('Failed to fetch current gas price');
        }
    }
    async getCurrentBlockNumber() {
        try {
            const blockNumber = await this.provider.getBlockNumber();
            console.log('🌐 Block number fetched from network');
            return blockNumber;
        }
        catch (error) {
            console.error('Error fetching block number:', error);
            throw new Error('Failed to fetch current block number');
        }
    }
    async getBalance(address) {
        try {
            if (!ethers_1.ethers.isAddress(address)) {
                throw new Error('Invalid Ethereum address format');
            }
            const balance = await this.provider.getBalance(address);
          
            return ethers_1.ethers.formatEther(balance);
        }
        catch (error) {
            console.error('Error fetching balance:', error);
            throw new Error(`Failed to fetch balance for address: ${address}`);
        }
    }
    async getEthereumData(address) {
        try {
            if (!ethers_1.ethers.isAddress(address)) {
                throw new Error('Invalid Ethereum address format');
            }
           
            const [gasPrice, currentBlockNumber, balance] = await Promise.all([
                this.getCurrentGasPrice(),
                this.getCurrentBlockNumber(),
                this.getBalance(address)
            ]);
            const ethereumData = {
                gasPrice,
                currentBlockNumber,
                balance,
                address
            };
            return ethereumData;
        }
        catch (error) {
            console.error('Error fetching Ethereum data:', error);
            throw error;
        }
    }
}
exports.EthereumServiceImpl = EthereumServiceImpl;
//# sourceMappingURL=ethereumService.js.map