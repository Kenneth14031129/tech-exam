// Contract deployment configuration
export const CONTRACT_CONFIG = {
  local: {
    chainId: 31337,
    name: 'Hardhat Local',
    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    rpcUrl: 'http://127.0.0.1:8545'
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    contractAddress: '',
    rpcUrl: process.env.REACT_APP_SEPOLIA_RPC_URL || ''
  }
};

export const ACTIVE_NETWORK = CONTRACT_CONFIG.local;

export const NFT_CONTRACT = {
  address: ACTIVE_NETWORK.contractAddress,
  chainId: ACTIVE_NETWORK.chainId,
  name: 'TechExamNFT',
  symbol: 'TENFT',
  mintPrice: '0.01',
  maxSupply: 10000
};