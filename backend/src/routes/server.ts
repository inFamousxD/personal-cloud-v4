import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { client } from '../db.js';

const execAsync = promisify(exec);
const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

interface ProcessInfo {
    pid: number;
    name: string;
    cpu: number;
    memory: number;
    memoryMB: number;
    user: string;
    status: string;
    command: string;
}

interface SystemStats {
    platform: string;
    arch: string;
    hostname: string;
    uptime: number;
    totalMemory: number;
    freeMemory: number;
    usedMemory: number;
    memoryUsagePercent: string;
    cpuCount: number;
    cpuModel: string;
    cpuUsagePercent: number;
}

interface ProcessStats {
    uptime: number;
    memoryUsage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
    nodeVersion: string;
}

interface DatabaseStats {
    collections: number;
    dataSize: number;
    storageSize: number;
    indexes: number;
    indexSize: number;
}

// GET system processes
router.get('/processes', async (_req: AuthRequest, res: Response) => {
    try {
        const platform = os.platform();
        let processes: ProcessInfo[] = [];

        if (platform === 'linux' || platform === 'darwin') {
            // Use ps command to get process information
            // Format: PID USER %CPU %MEM STAT COMMAND
            const { stdout } = await execAsync(
                'ps aux --sort=-%cpu | head -100'
            );

            const lines = stdout.trim().split('\n').slice(1); // Skip header
            
            processes = lines.map(line => {
                const parts = line.trim().split(/\s+/);
                const user = parts[0];
                const pid = parseInt(parts[1]);
                const cpu = parseFloat(parts[2]);
                const memory = parseFloat(parts[3]);
                const memoryMB = (memory / 100) * os.totalmem() / (1024 * 1024);
                const status = parts[7] || 'unknown';
                const command = parts.slice(10).join(' ').substring(0, 100); // Limit command length
                const name = parts[10] || 'unknown';

                return {
                    pid,
                    name,
                    cpu,
                    memory,
                    memoryMB,
                    user,
                    status,
                    command
                };
            });
        } else if (platform === 'win32') {
            // Windows - use tasklist
            const { stdout } = await execAsync(
                'powershell "Get-Process | Select-Object -First 100 Name, Id, CPU, WorkingSet | ConvertTo-Csv -NoTypeInformation"'
            );

            const lines = stdout.trim().split('\n').slice(1); // Skip header
            const totalMemory = os.totalmem();

            processes = lines.map(line => {
                const parts = line.replace(/"/g, '').split(',');
                const name = parts[0];
                const pid = parseInt(parts[1]);
                const cpu = parseFloat(parts[2]) || 0;
                const memoryBytes = parseInt(parts[3]) || 0;
                const memoryMB = memoryBytes / (1024 * 1024);
                const memory = (memoryBytes / totalMemory) * 100;

                return {
                    pid,
                    name,
                    cpu,
                    memory,
                    memoryMB,
                    user: 'system',
                    status: 'running',
                    command: name
                };
            });
        }

        res.json({
            processes,
            timestamp: new Date().toISOString(),
            count: processes.length
        });
    } catch (error: any) {
        console.error('Error fetching processes:', error);
        res.status(500).json({
            error: 'Failed to fetch process information',
            message: error.message
        });
    }
});

// GET server health
router.get('/health', async (_req: AuthRequest, res: Response) => {
    try {
        const dbStatus = client.db().admin().ping();
        await dbStatus;

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            uptime: process.uptime()
        });
    }
});

// GET server statistics
router.get('/stats', async (_req: AuthRequest, res: Response) => {
    try {
        const cpus = os.cpus();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;

        // Calculate CPU usage
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type as keyof typeof cpu.times];
            }
            totalIdle += cpu.times.idle;
        });

        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const cpuUsagePercent = 100 - ~~(100 * idle / total);

        const systemStats: SystemStats = {
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            uptime: os.uptime(),
            totalMemory,
            freeMemory,
            usedMemory,
            memoryUsagePercent: ((usedMemory / totalMemory) * 100).toFixed(2),
            cpuCount: cpus.length,
            cpuModel: cpus[0].model,
            cpuUsagePercent
        };

        const processStats: ProcessStats = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version
        };

        // Get database stats
        let databaseStats: DatabaseStats | null = null;
        try {
            const dbStats = await client.db().stats();
            databaseStats = {
                collections: dbStats.collections,
                dataSize: dbStats.dataSize,
                storageSize: dbStats.storageSize,
                indexes: dbStats.indexes,
                indexSize: dbStats.indexSize
            };
        } catch (error) {
            console.error('Error fetching database stats:', error);
        }

        res.json({
            system: systemStats,
            process: processStats,
            database: databaseStats
        });
    } catch (error: any) {
        console.error('Error fetching server stats:', error);
        res.status(500).json({
            error: 'Failed to fetch server statistics',
            message: error.message
        });
    }
});

// GET server ping
router.get('/ping', async (_req: AuthRequest, res: Response) => {
    res.json({
        pong: true,
        timestamp: new Date().toISOString()
    });
});

export default router;