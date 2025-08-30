"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = require("redis");
class CacheService {
    constructor(redisUrl) {
        this.isConnected = false;
        this.client = (0, redis_1.createClient)({
            url: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });
        this.client.on('connect', () => {
            console.log('✅ Redis connected successfully');
            this.isConnected = true;
        });
    }
    async connect() {
        try {
            await this.client.connect();
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
            this.isConnected = false;
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
    async get(key) {
        if (!this.isConnected)
            return null;
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttlSeconds = 60) {
        if (!this.isConnected)
            return false;
        try {
            const stringValue = JSON.stringify(value);
            await this.client.setEx(key, ttlSeconds, stringValue);
            return true;
        }
        catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }
    async del(key) {
        if (!this.isConnected)
            return false;
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }
    async exists(key) {
        if (!this.isConnected)
            return false;
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }
    isReady() {
        return this.isConnected;
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
//# sourceMappingURL=cacheService.js.map