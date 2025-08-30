"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const ethereum_1 = __importDefault(require("./routes/ethereum"));
const validation_1 = require("./middleware/validation");

dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)()); 
app.use((0, morgan_1.default)('combined')); 
app.use(express_1.default.json()); 
app.use(express_1.default.urlencoded({ extended: true })); 
// Rate limiting
app.use((0, validation_1.rateLimiter)(60000, 100)); 
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Ethereum API Server is running',
        timestamp: Date.now(),
        version: '1.0.0'
    });
});
// API Documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Ethereum API v1.0.0',
        endpoints: {
            'GET /api/ethereum/:address': 'Get complete Ethereum data (gas price, block number, balance) for an address',
            'GET /api/ethereum/network/gas-price': 'Get current gas price in Gwei',
            'GET /api/ethereum/network/block-number': 'Get current block number',
            'GET /api/ethereum/balance/:address': 'Get balance for specific address',
            'GET /health': 'Health check endpoint'
        },
        timestamp: Date.now()
    });
});
// Routes
app.use('/api/ethereum', ethereum_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        timestamp: Date.now()
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: Date.now()
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Ethereum API Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API docs: http://localhost:${PORT}/api`);
    console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map