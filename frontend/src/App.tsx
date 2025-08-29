import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  error: string | null;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
}

function App() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: null,
    isConnected: false,
    error: null,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setWallet(prev => ({ ...prev, error: null }));

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);

      setWallet({
        address,
        balance: balanceInEth,
        isConnected: true,
        error: null,
      });

      await fetchTransactions(address, provider);
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        error: error.message || 'Failed to connect wallet',
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (address: string, provider: ethers.BrowserProvider) => {
    try {
      const currentBlock = await provider.getBlockNumber();

      // For demo purposes, we'll show the last 10 blocks the address was involved in
      const recentTxs: Transaction[] = [];
      for (let i = currentBlock; i > currentBlock - 10 && i >= 0; i--) {
        try {
          const block = await provider.getBlock(i);
          if (block && block.transactions.length > 0) {
            // Get the first transaction from each block for demo
            const txHash = block.transactions[0];
            const tx = await provider.getTransaction(txHash);
            if (tx) {
              recentTxs.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to || '',
                value: ethers.formatEther(tx.value),
                timestamp: block.timestamp,
                blockNumber: block.number,
              });
            }
          }
        } catch (err) {
          // Skip blocks that can't be fetched
        }
      }

      setTransactions(recentTxs.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      balance: null,
      isConnected: false,
      error: null,
    });
    setTransactions([]);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Ethereum Wallet
            </h1>
            <p className="text-xl text-indigo-200 font-light">
              Your Gateway to the Blockchain
            </p>
          </div>
          
          {!wallet.isConnected ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center">
                  {/* Wallet icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2V8h10v8H12zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Connect Your Wallet
                  </h2>
                  <p className="text-indigo-200 mb-8 leading-relaxed">
                    Connect with MetaMask to view your balance, transaction history, and interact with the Ethereum blockchain
                  </p>
                  
                  <button
                    onClick={connectWallet}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <span>Connect Wallet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Wallet Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Balance Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Account Balance</h3>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {parseFloat(wallet.balance || '0').toFixed(4)} ETH
                  </div>
                  <div className="text-emerald-300 text-sm">
                    ≈ ${(parseFloat(wallet.balance || '0') * 2500).toLocaleString()} USD
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Wallet Address</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigator.clipboard.writeText(wallet.address || '')}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200"
                        title="Copy wallet address to clipboard"
                        aria-label="Copy wallet address to clipboard"
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                      </button>
                      <button
                        onClick={disconnectWallet}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 font-medium py-2 px-4 rounded-lg transition-all duration-200"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 font-mono text-sm text-gray-200 break-all border border-white/10">
                    {wallet.address}
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Recent Transactions</h3>
                  </div>
                  <span className="text-cyan-300 text-sm bg-cyan-500/20 px-3 py-1 rounded-full">
                    Sample Data
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <p className="text-white/60 text-lg">No recent transactions found</p>
                    <p className="text-white/40 text-sm mt-2">Transactions will appear here once available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx, index) => (
                      <div key={tx.hash} className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="text-white font-semibold">Network Transaction</h4>
                                <p className="text-white/60 text-sm">Block #{tx.blockNumber}</p>
                              </div>
                            </div>
                            
                            <div className="bg-black/20 rounded-xl p-3 mb-4">
                              <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                              <p className="text-white/80 font-mono text-xs break-all">{tx.hash}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-xs text-gray-400 mb-1">From</p>
                                <p className="text-white/80 font-mono text-sm">{tx.from.slice(0, 8)}...{tx.from.slice(-6)}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-xs text-gray-400 mb-1">To</p>
                                <p className="text-white/80 font-mono text-sm">{tx.to.slice(0, 8)}...{tx.to.slice(-6)}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-xs text-gray-400 mb-1">Value</p>
                                <p className="text-emerald-300 font-semibold">{parseFloat(tx.value).toFixed(4)} ETH</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right ml-6">
                            <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium mb-2">
                              Confirmed
                            </div>
                            <p className="text-white/60 text-xs">
                              {new Date(tx.timestamp * 1000).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {wallet.error && (
            <div className="max-w-2xl mx-auto mt-8">
              <div className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <strong className="font-semibold">Connection Error</strong>
                    <p className="text-sm text-red-300 mt-1">{wallet.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
