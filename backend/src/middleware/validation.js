"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.validateEthereumAddress = void 0;
const express_1 = require("express");
const ethers_1 = require("ethers");
const validateEthereumAddress = (req, res, next) => {
    const { address } = req.params;
    if (!address) {
        return res.status(400).json({
            success: false,
            error: 'Ethereum address is required',
            timestamp: Date.now()
        });
    }
    if (!ethers_1.ethers.isAddress(address)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Ethereum address format',
            timestamp: Date.now()
        });
    }
    next();
};
exports.validateEthereumAddress = validateEthereumAddress;
const rateLimiter = (windowMs = 60000, max = 100) => {
    const requests = new Map();
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        for (const [ip, data] of requests.entries()) {
            if (data.resetTime < windowStart) {
                requests.delete(ip);
            }
        }
        const clientData = requests.get(clientIP);
        if (!clientData) {
            requests.set(clientIP, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (clientData.resetTime < now) {
            requests.set(clientIP, { count: 1, resetTime: now + windowMs });
            return next();
        }
        if (clientData.count >= max) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests, please try again later',
                timestamp: now
            });
        }
        clientData.count++;
        next();
    };
};
exports.rateLimiter = rateLimiter;
//# sourceMappingURL=validation.js.map