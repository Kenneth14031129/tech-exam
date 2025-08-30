export declare class CacheService {
    private client;
    private isConnected;
    constructor(redisUrl?: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    isReady(): boolean;
}
export declare const cacheService: CacheService;
