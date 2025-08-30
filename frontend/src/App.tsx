import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Sparkles, Copy, FileText, CheckCircle, AlertCircle, Loader2, Plus, RotateCcw, ExternalLink, Star, Info } from 'lucide-react';
import { useContract } from './hooks/useContract';
import { NFT_CONTRACT } from './contracts/config';
import { transactionService, Transaction } from './services/transactionService';

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  error: string | null;
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
  const [activeTab, setActiveTab] = useState<'wallet' | 'nft'>('wallet');
  const [mintForm, setMintForm] = useState({ tokenURI: '', isOpen: false });
  const [apiStatus] = useState(transactionService.getApiStatus());

  const contract = useContract(wallet.address || undefined);

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

      await fetchTransactions(address);
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        error: error.message || 'Failed to connect wallet',
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (address: string) => {
    try {
      setLoading(true);
      const transactions = await transactionService.fetchTransactionHistory(address, 1, 10);
      setTransactions(transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
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
              Tech Exam DApp
            </h1>
            <p className="text-xl text-indigo-200 font-light">
              Complete Web3 Experience - Wallet + NFT Minting
            </p>
          </div>
          
          {!wallet.isConnected ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center">
                  
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-white" />
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
                        <Loader2 className="animate-spin h-5 w-5" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        <span>Connect Wallet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Navigation Tabs */}
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('wallet')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === 'wallet'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Wallet size={18} />
                        <span>Wallet</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('nft')}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        activeTab === 'nft'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Sparkles size={18} />
                        <span>NFT Collection</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'wallet' && (
                <>
                  {/* Wallet Info Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Balance Card */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Account Balance</h3>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
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
                        <Copy className="w-4 h-4 text-white" />
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
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Recent Transactions</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Info size={16} className="text-blue-300" />
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      apiStatus.configured 
                        ? 'text-green-300 bg-green-500/20' 
                        : 'text-yellow-300 bg-yellow-500/20'
                    }`}>
                      {apiStatus.configured ? 'Live Data' : 'Sample Data'}
                    </span>
                  </div>
                </div>

                {!apiStatus.configured && (
                  <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-yellow-300 mt-0.5" />
                      <div className="text-yellow-100">
                        <p className="font-medium mb-1">Using Sample Transaction Data</p>
                        <p className="text-sm text-yellow-200/80">
                          To fetch real transaction history, add your Etherscan API key to the .env file.
                          Get a free API key at <span className="font-mono bg-yellow-500/20 px-1 rounded">etherscan.io/register</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white/50" />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                <p className="text-emerald-300 font-semibold">{parseFloat(tx.value).toFixed(6)} ETH</p>
                              </div>
                              {tx.gasPrice && (
                                <div className="bg-white/5 rounded-lg p-3">
                                  <p className="text-xs text-gray-400 mb-1">Gas Price</p>
                                  <p className="text-blue-300 font-medium">{parseFloat(tx.gasPrice).toFixed(2)} Gwei</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right ml-6">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                              tx.status === 'success' 
                                ? 'bg-green-500/20 text-green-300' 
                                : tx.status === 'failed'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-green-500/20 text-green-300'
                            }`}>
                              {tx.status === 'success' ? 'Success' : tx.status === 'failed' ? 'Failed' : 'Confirmed'}
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
                </>
              )}

              {activeTab === 'nft' && (
                <NFTSection
                  contract={contract}
                  userAddress={wallet.address}
                  mintForm={mintForm}
                  setMintForm={setMintForm}
                />
              )}
            </div>
          )}

          {wallet.error && (
            <div className="max-w-2xl mx-auto mt-8">
              <div className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-red-400" />
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

// NFT Section Component
interface NFTSectionProps {
  contract: ReturnType<typeof useContract>;
  userAddress: string | null;
  mintForm: { tokenURI: string; isOpen: boolean };
  setMintForm: (form: { tokenURI: string; isOpen: boolean }) => void;
}

const NFTSection: React.FC<NFTSectionProps> = ({ contract, userAddress, mintForm, setMintForm }) => {
  const handleMint = async () => {
    if (!mintForm.tokenURI.trim()) {
      alert('Please enter a token URI');
      return;
    }

    try {
      const result = await contract.mintToken(mintForm.tokenURI);
      alert(`Success! Token minted with ID: ${result.tokenId}\nTransaction: ${result.transactionHash}`);
      setMintForm({ tokenURI: '', isOpen: false });
    } catch (error: any) {
      alert(`Minting failed: ${error.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Contract Info & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract Statistics */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Contract Stats</h3>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total Supply</span>
              <span className="text-white font-semibold">{contract.currentSupply} / {NFT_CONTRACT.maxSupply}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Mint Price</span>
              <span className="text-green-300 font-semibold">{contract.mintPrice} ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Your Tokens</span>
              <span className="text-white font-semibold">{contract.userTokens.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Contract</span>
              <button
                onClick={() => copyToClipboard(NFT_CONTRACT.address)}
                className="text-indigo-300 hover:text-indigo-200 font-mono text-sm"
                title="Click to copy contract address"
              >
                {NFT_CONTRACT.address.slice(0, 8)}...{NFT_CONTRACT.address.slice(-6)}
              </button>
            </div>
          </div>
        </div>

        {/* Mint NFT */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Mint NFT</h3>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {!mintForm.isOpen ? (
            <div className="text-center">
              <p className="text-white/70 mb-4">
                Mint your own Tech Exam NFT for {NFT_CONTRACT.mintPrice} ETH
              </p>
              <button
                onClick={() => setMintForm({ ...mintForm, isOpen: true })}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Mint NFT</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Token Metadata URI
                </label>
                <input
                  type="text"
                  value={mintForm.tokenURI}
                  onChange={(e) => setMintForm({ ...mintForm, tokenURI: e.target.value })}
                  placeholder="https://example.com/metadata/1.json"
                  className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-indigo-400 focus:outline-none"
                />
                <p className="text-white/50 text-xs mt-1">
                  Enter the metadata URI for your NFT
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleMint}
                  disabled={contract.isLoading || !mintForm.tokenURI.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  {contract.isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Minting...
                    </>
                  ) : (
                    `Mint for ${NFT_CONTRACT.mintPrice} ETH`
                  )}
                </button>
                <button
                  onClick={() => setMintForm({ tokenURI: '', isOpen: false })}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NFT Collection */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Your NFT Collection</h3>
          </div>
          <button
            onClick={() => contract.refetch()}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            <div className="flex items-center space-x-1">
              <RotateCcw className="w-4 h-4" />
              <span>Refresh</span>
            </div>
          </button>
        </div>

        {contract.isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-white mx-auto mb-4" />
            <p className="text-white/60">Loading your NFTs...</p>
          </div>
        ) : contract.userTokens.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white/50" />
            </div>
            <p className="text-white/60 text-lg mb-2">No NFTs yet</p>
            <p className="text-white/40 text-sm">Mint your first NFT to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contract.userTokens.map((token) => (
              <div key={token.tokenId} className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{token.tokenId}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Tech Exam NFT</h4>
                      <p className="text-white/60 text-sm">Token ID: {token.tokenId}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Metadata URI</p>
                  <p className="text-white/80 font-mono text-xs break-all">{token.tokenURI}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(token.tokenURI)}
                    className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-medium py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                  >
                    <div className="flex items-center space-x-1">
                      <Copy className="w-3 h-3" />
                      <span>Copy URI</span>
                    </div>
                  </button>
                  <button
                    onClick={() => window.open(`https://etherscan.io/token/${NFT_CONTRACT.address}?a=${token.tokenId}`, '_blank')}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 font-medium py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                  >
                    <div className="flex items-center space-x-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>View</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {contract.error && (
        <div className="bg-red-500/10 backdrop-blur-lg border border-red-500/20 text-red-200 px-6 py-4 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <strong className="font-semibold">Smart Contract Error</strong>
              <p className="text-sm text-red-300 mt-1">{contract.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
