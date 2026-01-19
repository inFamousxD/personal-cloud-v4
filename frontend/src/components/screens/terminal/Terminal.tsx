import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

import {
    TerminalContainer,
    TerminalHeader,
    TerminalHeaderLeft,
    TerminalTitle,
    ConnectionStatus,
    TerminalActions,
    ActionButton,
    TerminalBody,
    TerminalOverlay,
    ReconnectButton,
    LoadingSpinner,
    SessionInfo,
} from './Terminal.styles';
import { useTerminalWebSocket } from './useTerminalWebSocket';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const Terminal: React.FC = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const topOptions = useSelector((state: RootState) => state.mainDock.dockTopOptions);
    const bottomOptions = useSelector((state: RootState) => state.mainDock.dockBottomOptions);
    const terminalOption = [...topOptions, ...bottomOptions].find(o => o.id === 'terminal');

    const {
        status,
        sessionId,
        pid,
        connect,
        disconnect,
        reconnect,
        sendInput,
        sendResize,
    } = useTerminalWebSocket(xtermRef.current, {
        onConnect: (sid, p) => {
            console.log(`Connected to terminal session: ${sid}, PID: ${p}`);
            setError(null);
        },
        onDisconnect: (code, reason) => {
            console.log(`Disconnected: ${code} - ${reason}`);
        },
        onError: (err) => {
            setError(err);
        },
    });

    // Initialize xterm.js
    useEffect(() => {
        if (!terminalRef.current || xtermRef.current) return;

        const xterm = new XTerm({
            cursorBlink: true,
            cursorStyle: 'bar',
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace",
            theme: {
                background: '#0d0d0d',
                foreground: '#e0e0e0',
                cursor: '#a855f7',
                cursorAccent: '#0d0d0d',
                selectionBackground: '#a855f740',
                black: '#1a1a2e',
                red: '#e74c3c',
                green: '#2ecc71',
                yellow: '#f1c40f',
                blue: '#3498db',
                magenta: '#a855f7',
                cyan: '#00d9ff',
                white: '#ecf0f1',
                brightBlack: '#636e72',
                brightRed: '#ff6b6b',
                brightGreen: '#55efc4',
                brightYellow: '#ffeaa7',
                brightBlue: '#74b9ff',
                brightMagenta: '#d63384',
                brightCyan: '#81ecec',
                brightWhite: '#ffffff',
            },
            allowProposedApi: true,
            scrollback: 10000,
            convertEol: true,
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        
        xterm.loadAddon(fitAddon);
        xterm.loadAddon(webLinksAddon);
        
        xterm.open(terminalRef.current);
        
        // Fit to container
        setTimeout(() => {
            fitAddon.fit();
        }, 0);

        xtermRef.current = xterm;
        fitAddonRef.current = fitAddon;
        setIsInitialized(true);

        // Handle input
        xterm.onData((data) => {
            sendInput(data);
        });

        // Handle resize
        const handleResize = () => {
            if (fitAddonRef.current && xtermRef.current) {
                fitAddonRef.current.fit();
                sendResize(xtermRef.current.cols, xtermRef.current.rows);
            }
        };

        window.addEventListener('resize', handleResize);

        // Welcome message
        xterm.write('\x1b[1;35m╔════════════════════════════════════════╗\x1b[0m\r\n');
        xterm.write('\x1b[1;35m║\x1b[0m    \x1b[1;36mTerminal\x1b[0m                            \x1b[1;35m║\x1b[0m\r\n');
        xterm.write('\x1b[1;35m║\x1b[0m    Press \x1b[1;32mConnect\x1b[0m to start a session    \x1b[1;35m║\x1b[0m\r\n');
        xterm.write('\x1b[1;35m╚════════════════════════════════════════╝\x1b[0m\r\n\r\n');

        return () => {
            window.removeEventListener('resize', handleResize);
            xterm.dispose();
            xtermRef.current = null;
            fitAddonRef.current = null;
        };
    }, [sendInput, sendResize]);

    // Refit terminal when becoming visible
    useEffect(() => {
        if (isInitialized && fitAddonRef.current) {
            const timer = setTimeout(() => {
                fitAddonRef.current?.fit();
                if (xtermRef.current && status === 'connected') {
                    sendResize(xtermRef.current.cols, xtermRef.current.rows);
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isInitialized, status, sendResize]);

    const handleConnect = useCallback(() => {
        if (xtermRef.current) {
            xtermRef.current.clear();
            xtermRef.current.write('\x1b[33mConnecting to server...\x1b[0m\r\n');
        }
        connect();
    }, [connect]);

    const handleDisconnect = useCallback(() => {
        disconnect();
        if (xtermRef.current) {
            xtermRef.current.write('\r\n\x1b[33m[Disconnected]\x1b[0m\r\n');
        }
    }, [disconnect]);

    const handleReconnect = useCallback(() => {
        if (xtermRef.current) {
            xtermRef.current.clear();
            xtermRef.current.write('\x1b[33mReconnecting...\x1b[0m\r\n');
        }
        reconnect();
    }, [reconnect]);

    const handleClear = useCallback(() => {
        if (xtermRef.current) {
            xtermRef.current.clear();
        }
    }, []);

    const getStatusText = () => {
        switch (status) {
            case 'connected': return 'Connected';
            case 'connecting': return 'Connecting...';
            case 'disconnected': return 'Disconnected';
        }
    };

    return (
        <TerminalContainer>
            <TerminalHeader>
                <TerminalHeaderLeft>
                    <TerminalTitle>
                        <span className="material-symbols-outlined">
                            {terminalOption?.icon || 'terminal'}
                        </span>
                        Terminal
                    </TerminalTitle>
                    <ConnectionStatus $status={status}>
                        <span className="status-dot" />
                        <span>{getStatusText()}</span>
                    </ConnectionStatus>
                    {sessionId && pid && (
                        <SessionInfo>
                            PID: {pid}
                        </SessionInfo>
                    )}
                </TerminalHeaderLeft>
                <TerminalActions>
                    {status === 'disconnected' ? (
                        <ActionButton $variant="primary" onClick={handleConnect}>
                            <span className="material-symbols-outlined">play_arrow</span>
                            <span>Connect</span>
                        </ActionButton>
                    ) : status === 'connected' ? (
                        <>
                            <ActionButton onClick={handleClear}>
                                <span className="material-symbols-outlined">clear_all</span>
                                <span>Clear</span>
                            </ActionButton>
                            <ActionButton $variant="danger" onClick={handleDisconnect}>
                                <span className="material-symbols-outlined">stop</span>
                                <span>Disconnect</span>
                            </ActionButton>
                        </>
                    ) : (
                        <ActionButton disabled>
                            <span className="material-symbols-outlined">hourglass_empty</span>
                            <span>Connecting...</span>
                        </ActionButton>
                    )}
                </TerminalActions>
            </TerminalHeader>

            <TerminalBody>
                <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />
                
                {status === 'connecting' && (
                    <TerminalOverlay>
                        <LoadingSpinner>
                            <div className="lds-ring">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </LoadingSpinner>
                        <h3>Connecting to Terminal</h3>
                        <p>Establishing secure connection to the server...</p>
                    </TerminalOverlay>
                )}

                {error && status === 'disconnected' && (
                    <TerminalOverlay>
                        <span className="material-symbols-outlined">error</span>
                        <h3>Connection Error</h3>
                        <p>{error}</p>
                        <ReconnectButton onClick={handleReconnect}>
                            <span className="material-symbols-outlined">refresh</span>
                            Try Again
                        </ReconnectButton>
                    </TerminalOverlay>
                )}
            </TerminalBody>
        </TerminalContainer>
    );
};

export default Terminal;