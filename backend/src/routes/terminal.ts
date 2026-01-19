import { Router, Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn, IPty } from 'node-pty';
import { Server } from 'http';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Store active terminal sessions
const sessions = new Map<string, {
    pty: IPty;
    ws: WebSocket;
    lastActivity: number;
}>();

// Health check endpoint
router.get('/health', authenticateToken, (_req: AuthRequest, res: Response) => {
    res.json({ 
        status: 'ok', 
        activeSessions: sessions.size 
    });
});

// Cleanup inactive sessions periodically (30 min timeout)
const SESSION_TIMEOUT = 30 * 60 * 1000;
setInterval(() => {
    const now = Date.now();
    sessions.forEach((session, id) => {
        if (now - session.lastActivity > SESSION_TIMEOUT) {
            console.log(`Cleaning up inactive terminal session: ${id}`);
            session.pty.kill();
            session.ws.close();
            sessions.delete(id);
        }
    });
}, 60000); // Check every minute

// Initialize WebSocket server for terminal
export function initTerminalWebSocket(server: Server) {
    const wss = new WebSocketServer({ 
        server,
        path: '/ws/terminal'
    });

    wss.on('connection', (ws: WebSocket, req) => {
        console.log('Terminal WebSocket connection attempt');

        // Extract token from query string
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
            console.log('No token provided, closing connection');
            ws.close(4001, 'Authentication required');
            return;
        }

        // Verify token (reusing your auth logic)
        let userId: string;
        try {
            // Decode JWT (Google tokens are self-contained)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                Buffer.from(base64, 'base64')
                    .toString()
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            if (!decoded || !decoded.email) {
                throw new Error('Invalid token');
            }
            
            // Check expiration
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                throw new Error('Token expired');
            }
            
            userId = decoded.email;
            console.log(`Terminal authenticated for user: ${userId}`);
        } catch (error) {
            console.log('Token verification failed:', error);
            ws.close(4001, 'Authentication failed');
            return;
        }

        const sessionId = `${userId}-${Date.now()}`;
        
        // Spawn PTY process
        const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
        const pty = spawn(shell, [], {
            name: 'xterm-256color',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME || '/home',
            env: {
                ...process.env,
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor',
            },
        });

        console.log(`Terminal session started: ${sessionId}, PID: ${pty.pid}`);

        // Store session
        sessions.set(sessionId, {
            pty,
            ws,
            lastActivity: Date.now(),
        });

        // Send session info to client
        ws.send(JSON.stringify({
            type: 'session',
            sessionId,
            pid: pty.pid,
        }));

        // PTY output -> WebSocket
        pty.onData((data: string) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'output',
                    data,
                }));
            }
        });

        // PTY exit
        pty.onExit(({ exitCode, signal }) => {
            console.log(`Terminal exited: ${sessionId}, code: ${exitCode}, signal: ${signal}`);
            
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'exit',
                    exitCode,
                    signal,
                }));
                ws.close(1000, 'Terminal exited');
            }
            
            sessions.delete(sessionId);
        });

        // WebSocket messages -> PTY
        ws.on('message', (message: Buffer) => {
            try {
                const msg = JSON.parse(message.toString());
                const session = sessions.get(sessionId);
                
                if (session) {
                    session.lastActivity = Date.now();
                }

                switch (msg.type) {
                    case 'input':
                        pty.write(msg.data);
                        break;
                    
                    case 'resize':
                        if (msg.cols && msg.rows) {
                            pty.resize(msg.cols, msg.rows);
                        }
                        break;
                    
                    case 'ping':
                        ws.send(JSON.stringify({ type: 'pong' }));
                        break;
                    
                    default:
                        console.log('Unknown message type:', msg.type);
                }
            } catch (error) {
                console.error('Error processing terminal message:', error);
            }
        });

        // WebSocket close
        ws.on('close', (code, reason) => {
            console.log(`Terminal WebSocket closed: ${sessionId}, code: ${code}, reason: ${reason}`);
            
            const session = sessions.get(sessionId);
            if (session) {
                session.pty.kill();
                sessions.delete(sessionId);
            }
        });

        // WebSocket error
        ws.on('error', (error) => {
            console.error(`Terminal WebSocket error: ${sessionId}`, error);
            
            const session = sessions.get(sessionId);
            if (session) {
                session.pty.kill();
                sessions.delete(sessionId);
            }
        });
    });

    console.log('Terminal WebSocket server initialized on /ws/terminal');
    return wss;
}

export default router;