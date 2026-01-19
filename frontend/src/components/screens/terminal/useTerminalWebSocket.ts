import { useRef, useCallback, useState, useEffect } from 'react';
import { Terminal } from 'xterm';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface TerminalMessage {
    type: 'session' | 'output' | 'exit' | 'pong' | 'error';
    data?: string;
    sessionId?: string;
    pid?: number;
    exitCode?: number;
    signal?: number;
    message?: string;
}

interface UseTerminalWebSocketOptions {
    onConnect?: (sessionId: string, pid: number) => void;
    onDisconnect?: (code: number, reason: string) => void;
    onError?: (error: string) => void;
}

const getWebSocketUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
    // Convert http(s) to ws(s)
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    return `${wsUrl}/ws/terminal`;
};

const getAuthToken = (): string | null => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return token;
    }
    return null;
};

export const useTerminalWebSocket = (
    terminal: Terminal | null,
    options: UseTerminalWebSocketOptions = {}
) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const inputQueueRef = useRef<string[]>([]);
    
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [pid, setPid] = useState<number | null>(null);

    const MAX_RECONNECT_ATTEMPTS = 5;
    const BASE_RECONNECT_DELAY = 1000;
    const PING_INTERVAL = 30000;

    const clearTimers = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
    }, []);

    const sendMessage = useCallback((message: object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, []);

    const sendInput = useCallback((data: string) => {
        if (!sendMessage({ type: 'input', data })) {
            // Queue input if not connected
            inputQueueRef.current.push(data);
        }
    }, [sendMessage]);

    const sendResize = useCallback((cols: number, rows: number) => {
        sendMessage({ type: 'resize', cols, rows });
    }, [sendMessage]);

    const flushInputQueue = useCallback(() => {
        while (inputQueueRef.current.length > 0) {
            const data = inputQueueRef.current.shift()!;
            if (!sendMessage({ type: 'input', data })) {
                inputQueueRef.current.unshift(data);
                break;
            }
        }
    }, [sendMessage]);

    const connect = useCallback(() => {
        const token = getAuthToken();
        if (!token) {
            options.onError?.('Not authenticated');
            setStatus('disconnected');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        clearTimers();
        setStatus('connecting');

        const wsUrl = `${getWebSocketUrl()}?token=${encodeURIComponent(token)}`;
        
        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Terminal WebSocket connected');
                setStatus('connected');
                reconnectAttemptsRef.current = 0;
                
                // Start ping interval
                pingIntervalRef.current = setInterval(() => {
                    sendMessage({ type: 'ping' });
                }, PING_INTERVAL);

                // Flush queued input
                flushInputQueue();

                // Send initial resize
                if (terminal) {
                    sendResize(terminal.cols, terminal.rows);
                }
            };

            ws.onmessage = (event) => {
                try {
                    const msg: TerminalMessage = JSON.parse(event.data);

                    switch (msg.type) {
                        case 'session':
                            setSessionId(msg.sessionId || null);
                            setPid(msg.pid || null);
                            options.onConnect?.(msg.sessionId!, msg.pid!);
                            break;

                        case 'output':
                            if (terminal && msg.data) {
                                terminal.write(msg.data);
                            }
                            break;

                        case 'exit':
                            console.log('Terminal process exited:', msg.exitCode);
                            terminal?.write(`\r\n\x1b[33m[Process exited with code ${msg.exitCode}]\x1b[0m\r\n`);
                            break;

                        case 'pong':
                            // Heartbeat acknowledged
                            break;

                        case 'error':
                            options.onError?.(msg.message || 'Unknown error');
                            break;
                    }
                } catch (error) {
                    console.error('Error parsing terminal message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('Terminal WebSocket closed:', event.code, event.reason);
                setStatus('disconnected');
                setSessionId(null);
                setPid(null);
                clearTimers();
                options.onDisconnect?.(event.code, event.reason);

                // Auto-reconnect on unexpected close
                if (event.code !== 1000 && event.code !== 4001) {
                    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
                        reconnectAttemptsRef.current++;
                        
                        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
                        terminal?.write(`\r\n\x1b[33m[Reconnecting in ${delay / 1000}s...]\x1b[0m\r\n`);
                        
                        reconnectTimeoutRef.current = setTimeout(connect, delay);
                    } else {
                        terminal?.write('\r\n\x1b[31m[Max reconnection attempts reached]\x1b[0m\r\n');
                    }
                }
            };

            ws.onerror = (error) => {
                console.error('Terminal WebSocket error:', error);
                options.onError?.('Connection error');
            };

        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            setStatus('disconnected');
            options.onError?.('Failed to connect');
        }
    }, [terminal, options, clearTimers, sendMessage, sendResize, flushInputQueue]);

    const disconnect = useCallback(() => {
        clearTimers();
        reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
        
        if (wsRef.current) {
            wsRef.current.close(1000, 'User disconnected');
            wsRef.current = null;
        }
        
        setStatus('disconnected');
        setSessionId(null);
        setPid(null);
    }, [clearTimers]);

    const reconnect = useCallback(() => {
        disconnect();
        reconnectAttemptsRef.current = 0;
        // Small delay to ensure clean disconnect
        setTimeout(connect, 100);
    }, [disconnect, connect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimers();
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }
        };
    }, [clearTimers]);

    return {
        status,
        sessionId,
        pid,
        connect,
        disconnect,
        reconnect,
        sendInput,
        sendResize,
    };
};