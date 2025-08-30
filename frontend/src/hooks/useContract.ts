import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { NFT_CONTRACT } from '../contracts/config';
import TechExamNFTABI from '../contracts/TechExamNFT.json';

export interface TokenData {
  tokenId: number;
  owner: string;
  tokenURI: string;
  mintedAt?: number;
}

export interface ContractState {
  isLoading: boolean;
  error: string | null;
  contract: ethers.Contract | null;
  signer: ethers.Signer | null;
  currentSupply: number;
  mintPrice: string;
  userTokens: TokenData[];
}

export const useContract = (address?: string) => {
  const [state, setState] = useState<ContractState>({
    isLoading: false,
    error: null,
    contract: null,
    signer: null,
    currentSupply: 0,
    mintPrice: NFT_CONTRACT.mintPrice,
    userTokens: []
  });

  const loadContractData = useCallback(async (contract: ethers.Contract, userAddress: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const [currentSupply, mintPrice, userTokens] = await Promise.all([
        contract.getCurrentSupply(),
        contract.mintPrice(),
        contract.tokensOfOwner(userAddress)
      ]);

      const tokenData: TokenData[] = [];
      for (const tokenId of userTokens) {
        try {
          const tokenURI = await contract.tokenURI(tokenId);
          tokenData.push({
            tokenId: Number(tokenId),
            owner: userAddress,
            tokenURI
          });
        } catch (err) {
          console.warn(`Failed to load metadata for token ${tokenId}:`, err);
        }
      }

      setState(prev => ({
        ...prev,
        currentSupply: Number(currentSupply),
        mintPrice: ethers.formatEther(mintPrice),
        userTokens: tokenData,
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load contract data'
      }));
    }
  }, []);

  const initContract = useCallback(async () => {
    try {
      if (!window.ethereum || !address) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        NFT_CONTRACT.address,
        TechExamNFTABI.abi,
        signer
      );

      setState(prev => ({
        ...prev,
        contract,
        signer,
        error: null
      }));

      await loadContractData(contract, address);
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to initialize contract'
      }));
    }
  }, [address, loadContractData]);

  const mintToken = useCallback(async (tokenURI: string) => {
    if (!state.contract || !address) {
      throw new Error('Contract not initialized');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const mintPrice = await state.contract.mintPrice();
      const tx = await state.contract.mint(address, tokenURI, {
        value: mintPrice,
        gasLimit: 300000
      });

      const receipt = await tx.wait();
      
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = state.contract!.interface.parseLog(log);
          return parsed?.name === 'TokenMinted';
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (event) {
        const parsed = state.contract.interface.parseLog(event);
        tokenId = Number(parsed?.args?.tokenId || 0);
      }

      await loadContractData(state.contract, address);

      return {
        success: true,
        transactionHash: receipt.hash,
        tokenId,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Minting failed'
      }));
      throw error;
    }
  }, [state.contract, address, loadContractData]);

  const transferToken = useCallback(async (tokenId: number, toAddress: string) => {
    if (!state.contract || !address) {
      throw new Error('Contract not initialized');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const tx = await state.contract.transferToken(address, toAddress, tokenId, {
        gasLimit: 150000
      });

      const receipt = await tx.wait();

      await loadContractData(state.contract, address);

      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Transfer failed'
      }));
      throw error;
    }
  }, [state.contract, address, loadContractData]);

  const isOwner = useCallback(async (): Promise<boolean> => {
    if (!state.contract || !address) return false;

    try {
      const owner = await state.contract.owner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch {
      return false;
    }
  }, [state.contract, address]);

  useEffect(() => {
    if (address) {
      initContract();
    }
  }, [address, initContract]);

  return {
    ...state,
    mintToken,
    transferToken,
    isOwner,
    refetch: () => state.contract && address ? loadContractData(state.contract, address) : Promise.resolve()
  };
};