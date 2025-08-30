"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ethereumService_1 = require("../services/ethereumService");
const types_1 = require("../types");
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
exports.default = router;
//# sourceMappingURL=ethereum.js.map