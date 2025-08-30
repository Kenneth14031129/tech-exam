"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ethereumService_1 = require("../services/ethereumService");
const router = (0, express_1.Router)();
const ethereumService = new ethereumService_1.EthereumServiceImpl(process.env.ETHEREUM_RPC_URL);

const createResponse = (success, data, error) => ({
    success,
    data,
    error,
    timestamp: Date.now()
});
// GET /api/ethereum/:address - Get Ethereum data for an address
router.get('/:address', async (req, res) => {
    try {
        const { address } = req.params;
        if (!address) {
            return res.status(400).json(createResponse(false, undefined, 'Ethereum address is required'));
        }
        const ethereumData = await ethereumService.getEthereumData(address);
        res.json(createResponse(true, ethereumData));
    }
    catch (error) {
        console.error('Error in /ethereum/:address:', error);
        let statusCode = 500;
        let errorMessage = 'Internal server error';
        if (error.message.includes('Invalid Ethereum address')) {
            statusCode = 400;
            errorMessage = error.message;
        }
        else if (error.message.includes('Failed to fetch')) {
            statusCode = 502;
            errorMessage = 'Failed to connect to Ethereum network';
        }
        res.status(statusCode).json(createResponse(false, undefined, errorMessage));
    }
});
// GET /api/ethereum/gas-price - Get current gas price
router.get('/network/gas-price', async (req, res) => {
    try {
        const gasPrice = await ethereumService.getCurrentGasPrice();
        res.json(createResponse(true, { gasPrice }));
    }
    catch (error) {
        console.error('Error fetching gas price:', error);
        res.status(502).json(createResponse(false, undefined, 'Failed to fetch gas price'));
    }
});
// GET /api/ethereum/block-number - Get current block number
router.get('/network/block-number', async (req, res) => {
    try {
        const blockNumber = await ethereumService.getCurrentBlockNumber();
        res.json(createResponse(true, { blockNumber }));
    }
    catch (error) {
        console.error('Error fetching block number:', error);
        res.status(502).json(createResponse(false, undefined, 'Failed to fetch block number'));
    }
});
// GET /api/ethereum/balance/:address - Get balance for specific address
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        if (!address) {
            return res.status(400).json(createResponse(false, undefined, 'Ethereum address is required'));
        }
        const balance = await ethereumService.getBalance(address);
        res.json(createResponse(true, { address, balance }));
    }
    catch (error) {
        console.error('Error fetching balance:', error);
        let statusCode = 500;
        let errorMessage = 'Failed to fetch balance';
        if (error.message.includes('Invalid Ethereum address')) {
            statusCode = 400;
            errorMessage = error.message;
        }
        res.status(statusCode).json(createResponse(false, undefined, errorMessage));
    }
});
// GET /api/ethereum/nft/:contractAddress/:tokenId - Get NFT metadata
router.get('/nft/:contractAddress/:tokenId', async (req, res) => {
    try {
        const { contractAddress, tokenId } = req.params;
        if (!contractAddress || !tokenId) {
            return res.status(400).json(createResponse(false, undefined, 'Contract address and token ID are required'));
        }
        const nftData = {
            contractAddress,
            tokenId: Number(tokenId),
            name: `Tech Exam NFT #${tokenId}`,
            description: 'A unique NFT from the Tech Exam project',
            image: `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenId}`,
            attributes: [
                {
                    trait_type: 'Category',
                    value: 'Tech Exam'
                },
                {
                    trait_type: 'Token ID',
                    value: tokenId
                }
            ],
            owner: 'Not available', 
            mintedAt: Date.now()
        };
        res.json(createResponse(true, nftData));
    }
    catch (error) {
        console.error('Error fetching NFT data:', error);
        res.status(500).json(createResponse(false, undefined, 'Failed to fetch NFT data'));
    }
});
// GET /api/ethereum/nft/:contractAddress/owner/:address - Get NFTs owned by address
router.get('/nft/:contractAddress/owner/:address', async (req, res) => {
    try {
        const { contractAddress, address } = req.params;
        if (!contractAddress || !address) {
            return res.status(400).json(createResponse(false, undefined, 'Contract address and owner address are required'));
        }
        const ownedTokens = {
            contractAddress,
            owner: address,
            tokenCount: 0,
            tokens: [],
            lastUpdated: Date.now()
        };
        res.json(createResponse(true, ownedTokens));
    }
    catch (error) {
        console.error('Error fetching owned tokens:', error);
        res.status(500).json(createResponse(false, undefined, 'Failed to fetch owned tokens'));
    }
});
// GET /api/ethereum/nft/:contractAddress/stats - Get contract statistics
router.get('/nft/:contractAddress/stats', async (req, res) => {
    try {
        const { contractAddress } = req.params;
        if (!contractAddress) {
            return res.status(400).json(createResponse(false, undefined, 'Contract address is required'));
        }
        const contractStats = {
            contractAddress,
            name: 'Tech Exam NFT',
            symbol: 'TENFT',
            totalSupply: 0,
            maxSupply: 10000,
            mintPrice: '0.01',
            owner: 'Not available',
            lastUpdated: Date.now()
        };
        res.json(createResponse(true, contractStats));
    }
    catch (error) {
        console.error('Error fetching contract stats:', error);
        res.status(500).json(createResponse(false, undefined, 'Failed to fetch contract stats'));
    }
});
exports.default = router;
//# sourceMappingURL=ethereum.js.map