import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);
const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Path to affine directory (relative to project root)
const AFFINE_DIR = path.join(process.cwd(), '..', 'affine');

interface DockerStats {
    containerId: string;
    name: string;
    cpuPercent: string;
    memUsage: string;
    memLimit: string;
    memPercent: string;
    netIO: string;
    blockIO: string;
}

// Helper function to execute docker commands in affine directory
async function executeDockerCommand(command: string): Promise<string> {
    const { stdout, stderr } = await execAsync(command, {
        cwd: AFFINE_DIR,
        timeout: 30000 // 30 second timeout
    });
    
    if (stderr && !stderr.includes('WARNING')) {
        console.error('Docker command stderr:', stderr);
    }
    
    return stdout.trim();
}

// GET affine server status
router.get('/status', async (_req: AuthRequest, res: Response) => {
    try {
        // Check if containers are running
        const psOutput = await executeDockerCommand('docker compose ps --format json');
        
        const containers = psOutput
            .split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
        
        const isRunning = containers.some(c => c.State === 'running');
        const runningCount = containers.filter(c => c.State === 'running').length;
        
        res.json({
            running: isRunning,
            containers: containers.map(c => ({
                name: c.Service,
                state: c.State,
                status: c.Status
            })),
            totalContainers: containers.length,
            runningContainers: runningCount
        });
    } catch (error: any) {
        console.error('Error checking Affine status:', error);
        res.status(500).json({ 
            error: 'Failed to check Affine status',
            message: error.message
        });
    }
});

// GET affine server stats (resource usage)
router.get('/stats', async (_req: AuthRequest, res: Response) => {
    try {
        // Get container IDs for affine
        const psOutput = await executeDockerCommand('docker compose ps -q');
        const containerIds = psOutput.split('\n').filter(id => id.trim());
        
        if (containerIds.length === 0) {
            return res.json({
                running: false,
                containers: []
            });
        }
        
        // Get stats for all containers (single snapshot, no stream)
        const statsOutput = await executeDockerCommand(
            `docker stats --no-stream --format "{{.Container}}|{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}|{{.BlockIO}}" ${containerIds.join(' ')}`
        );
        
        const stats: DockerStats[] = statsOutput
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [containerId, name, cpuPercent, memUsage, memPercent, netIO, blockIO] = line.split('|');
                const [memUsed, memLimit] = memUsage.split(' / ');
                
                return {
                    containerId: containerId.substring(0, 12),
                    name,
                    cpuPercent,
                    memUsage: memUsed,
                    memLimit,
                    memPercent,
                    netIO,
                    blockIO
                };
            });
        
        res.json({
            running: true,
            containers: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Error fetching Affine stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch Affine stats',
            message: error.message
        });
    }
});

// POST start affine server
router.post('/start', async (_req: AuthRequest, res: Response) => {
    try {
        const output = await executeDockerCommand('docker compose up -d');
        
        // Wait a moment for containers to start
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get status after starting
        const psOutput = await executeDockerCommand('docker compose ps --format json');
        const containers = psOutput
            .split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
        
        res.json({
            success: true,
            message: 'Affine server started',
            output,
            containers: containers.map(c => ({
                name: c.Service,
                state: c.State,
                status: c.Status
            }))
        });
    } catch (error: any) {
        console.error('Error starting Affine:', error);
        res.status(500).json({ 
            error: 'Failed to start Affine server',
            message: error.message
        });
    }
});

// POST stop affine server
router.post('/stop', async (_req: AuthRequest, res: Response) => {
    try {
        const output = await executeDockerCommand('docker compose down');
        
        res.json({
            success: true,
            message: 'Affine server stopped',
            output
        });
    } catch (error: any) {
        console.error('Error stopping Affine:', error);
        res.status(500).json({ 
            error: 'Failed to stop Affine server',
            message: error.message
        });
    }
});

// POST restart affine server
router.post('/restart', async (_req: AuthRequest, res: Response) => {
    try {
        const output = await executeDockerCommand('docker compose restart');
        
        // Wait a moment for containers to restart
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        res.json({
            success: true,
            message: 'Affine server restarted',
            output
        });
    } catch (error: any) {
        console.error('Error restarting Affine:', error);
        res.status(500).json({ 
            error: 'Failed to restart Affine server',
            message: error.message
        });
    }
});

// POST clear system cache
router.post('/clear-cache', async (_req: AuthRequest, res: Response) => {
    try {
        // Get memory stats before clearing
        const { stdout: beforeMem } = await execAsync('free -h');
        
        // Clear page cache, dentries and inodes
        // Using sh -c to handle the sudo and piping correctly
        await execAsync('sync');
        await execAsync('echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null');
        
        // Get memory stats after clearing
        const { stdout: afterMem } = await execAsync('free -h');
        
        res.json({
            success: true,
            message: 'System cache cleared',
            before: beforeMem,
            after: afterMem
        });
    } catch (error: any) {
        console.error('Error clearing cache:', error);
        res.status(500).json({ 
            error: 'Failed to clear system cache',
            message: error.message,
            details: 'Make sure the user has sudo permissions for /proc/sys/vm/drop_caches'
        });
    }
});

// GET docker compose logs
router.get('/logs', async (req: AuthRequest, res: Response) => {
    try {
        const lines = req.query.lines || '100';
        const output = await executeDockerCommand(`docker compose logs --tail=${lines}`);
        
        res.json({
            success: true,
            logs: output
        });
    } catch (error: any) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ 
            error: 'Failed to fetch logs',
            message: error.message
        });
    }
});

export default router;
