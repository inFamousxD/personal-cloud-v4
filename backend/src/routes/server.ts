import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import os from 'os';
import { db, client } from '../db.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET server health
router.get('/health', async (_req: AuthRequest, res: Response) => {
    try {
        // Check database connection
        const dbHealthy = !!client && client.connect !== undefined;

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbHealthy ? 'connected' : 'disconnected',
            uptime: process.uptime()
        });
    } catch (error) {
        console.error('Error checking health:', error);
        res.status(500).json({ 
            status: 'unhealthy',
            error: 'Failed to check health' 
        });
    }
});

// GET server stats
router.get('/stats', async (_req: AuthRequest, res: Response) => {
    try {
        // System info
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        
        // CPU info
        const cpus = os.cpus();
        const cpuCount = cpus.length;
        
        // Calculate average CPU usage
        let totalIdle = 0;
        let totalTick = 0;
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type as keyof typeof cpu.times];
            }
            totalIdle += cpu.times.idle;
        });
        const cpuUsagePercent = 100 - ~~(100 * totalIdle / totalTick);

        // Process info
        const processMemory = process.memoryUsage();

        // Database stats
        let dbStats = null;
        try {
            const stats = await db.stats();
            dbStats = {
                collections: stats.collections,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexes: stats.indexes,
                indexSize: stats.indexSize
            };
        } catch (error) {
            console.error('Error getting DB stats:', error);
        }

        res.json({
            system: {
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                uptime: os.uptime(),
                totalMemory,
                freeMemory,
                usedMemory,
                memoryUsagePercent: ((usedMemory / totalMemory) * 100).toFixed(2),
                cpuCount,
                cpuModel: cpus[0]?.model || 'Unknown',
                cpuUsagePercent
            },
            process: {
                uptime: process.uptime(),
                memoryUsage: {
                    rss: processMemory.rss,
                    heapTotal: processMemory.heapTotal,
                    heapUsed: processMemory.heapUsed,
                    external: processMemory.external
                },
                nodeVersion: process.version
            },
            database: dbStats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch server stats' });
    }
});

// GET ping
router.get('/ping', (_req: AuthRequest, res: Response) => {
    const start = Date.now();
    res.json({
        pong: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - start
    });
});

export default router;