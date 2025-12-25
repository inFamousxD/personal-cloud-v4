import { useState, useEffect } from 'react';
import { serverApi, HealthResponse, ServerStats, PingResponse } from '../../../services/serverApi';
import {
    ServerContainer,
    ServerHeader,
    ServerTitle,
    RefreshButton,
    ServerBody,
    StatsGrid,
    StatCard,
    StatCardHeader,
    StatCardBody,
    StatRow,
    ProgressBar,
    ProgressFill,
    StatusBadge,
    LoadingState,
    ErrorState,
    PingIndicator
} from './Server.styles';

const Server = () => {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [ping, setPing] = useState<PingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadServerData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadServerData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadServerData = async () => {
        try {
            setError(null);
            const isInitialLoad = loading;
            if (!isInitialLoad) setRefreshing(true);

            const [healthData, statsData, pingData] = await Promise.all([
                serverApi.getHealth(),
                serverApi.getStats(),
                serverApi.ping()
            ]);

            setHealth(healthData);
            setStats(statsData);
            setPing(pingData);
        } catch (error) {
            console.error('Error loading server data:', error);
            setError('Failed to load server data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number): string => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getMemoryColor = (percent: number): string => {
        if (percent < 70) return '#27AE60';
        if (percent < 85) return '#B95A1A';
        return '#e74c3c';
    };

    if (loading) {
        return (
            <ServerContainer>
                <LoadingState>
                    <div className="lds-ring">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </LoadingState>
            </ServerContainer>
        );
    }

    if (error && !stats) {
        return (
            <ServerContainer>
                <ServerHeader>
                    <ServerTitle>
                        <span className="material-symbols-outlined">dns</span>
                        Server
                    </ServerTitle>
                    <RefreshButton onClick={loadServerData}>
                        <span className="material-symbols-outlined">refresh</span>
                        Retry
                    </RefreshButton>
                </ServerHeader>
                <ErrorState>
                    <span className="material-symbols-outlined">error</span>
                    <h3>Connection Error</h3>
                    <p>{error}</p>
                </ErrorState>
            </ServerContainer>
        );
    }

    return (
        <ServerContainer>
            <ServerHeader>
                <ServerTitle>
                    <span className="material-symbols-outlined">dns</span>
                    Server Status
                    {ping && (
                        <PingIndicator $latency={ping.responseTime}>
                            <span className="material-symbols-outlined">
                                {ping.responseTime < 100 ? 'signal_cellular_alt' : 
                                 ping.responseTime < 300 ? 'signal_cellular_alt_2_bar' : 
                                 'signal_cellular_alt_1_bar'}
                            </span>
                            {ping.responseTime}ms
                        </PingIndicator>
                    )}
                </ServerTitle>
                <RefreshButton onClick={loadServerData} disabled={refreshing}>
                    <span className="material-symbols-outlined">refresh</span>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </RefreshButton>
            </ServerHeader>

            <ServerBody>
                <StatsGrid>
                    {/* Health Status */}
                    <StatCard $status={health?.status === 'healthy' ? 'success' : 'error'}>
                        <StatCardHeader>
                            <span className="material-symbols-outlined">
                                {health?.status === 'healthy' ? 'check_circle' : 'error'}
                            </span>
                            Health
                        </StatCardHeader>
                        <StatCardBody>
                            <StatRow>
                                <span>Status</span>
                                <StatusBadge $status={health?.status || 'unhealthy'}>
                                    <span className="material-symbols-outlined">
                                        {health?.status === 'healthy' ? 'check' : 'close'}
                                    </span>
                                    {health?.status || 'Unknown'}
                                </StatusBadge>
                            </StatRow>
                            <StatRow>
                                <span>Database</span>
                                <StatusBadge $status={health?.database || 'disconnected'}>
                                    <span className="material-symbols-outlined">
                                        {health?.database === 'connected' ? 'check' : 'close'}
                                    </span>
                                    {health?.database || 'Unknown'}
                                </StatusBadge>
                            </StatRow>
                            <StatRow>
                                <span>Server Uptime</span>
                                <span>{health?.uptime ? formatUptime(health.uptime) : 'N/A'}</span>
                            </StatRow>
                        </StatCardBody>
                    </StatCard>

                    {/* System Resources */}
                    {stats?.system && (
                        <StatCard>
                            <StatCardHeader>
                                <span className="material-symbols-outlined">memory</span>
                                System Resources
                            </StatCardHeader>
                            <StatCardBody>
                                <StatRow>
                                    <span>Memory Usage</span>
                                    <span>{stats.system.memoryUsagePercent}%</span>
                                </StatRow>
                                <ProgressBar>
                                    <ProgressFill 
                                        $percent={parseFloat(stats.system.memoryUsagePercent)} 
                                        $color={getMemoryColor(parseFloat(stats.system.memoryUsagePercent))}
                                    />
                                </ProgressBar>
                                <StatRow>
                                    <span>Used / Total</span>
                                    <span>{formatBytes(stats.system.usedMemory)} / {formatBytes(stats.system.totalMemory)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>CPU Usage</span>
                                    <span>{stats.system.cpuUsagePercent}%</span>
                                </StatRow>
                                <StatRow>
                                    <span>CPU Cores</span>
                                    <span>{stats.system.cpuCount}</span>
                                </StatRow>
                            </StatCardBody>
                        </StatCard>
                    )}

                    {/* System Info */}
                    {stats?.system && (
                        <StatCard>
                            <StatCardHeader>
                                <span className="material-symbols-outlined">info</span>
                                System Info
                            </StatCardHeader>
                            <StatCardBody>
                                <StatRow>
                                    <span>Platform</span>
                                    <span>{stats.system.platform}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Architecture</span>
                                    <span>{stats.system.arch}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Hostname</span>
                                    <span>{stats.system.hostname}</span>
                                </StatRow>
                                <StatRow>
                                    <span>System Uptime</span>
                                    <span>{formatUptime(stats.system.uptime)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Node Version</span>
                                    <span>{stats.process.nodeVersion}</span>
                                </StatRow>
                            </StatCardBody>
                        </StatCard>
                    )}

                    {/* Process Memory */}
                    {stats?.process && (
                        <StatCard>
                            <StatCardHeader>
                                <span className="material-symbols-outlined">widgets</span>
                                Process Memory
                            </StatCardHeader>
                            <StatCardBody>
                                <StatRow>
                                    <span>RSS</span>
                                    <span>{formatBytes(stats.process.memoryUsage.rss)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Heap Total</span>
                                    <span>{formatBytes(stats.process.memoryUsage.heapTotal)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Heap Used</span>
                                    <span>{formatBytes(stats.process.memoryUsage.heapUsed)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>External</span>
                                    <span>{formatBytes(stats.process.memoryUsage.external)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Process Uptime</span>
                                    <span>{formatUptime(stats.process.uptime)}</span>
                                </StatRow>
                            </StatCardBody>
                        </StatCard>
                    )}

                    {/* Database Storage */}
                    {stats?.database && (
                        <StatCard>
                            <StatCardHeader>
                                <span className="material-symbols-outlined">storage</span>
                                Database Storage
                            </StatCardHeader>
                            <StatCardBody>
                                <StatRow>
                                    <span>Collections</span>
                                    <span>{stats.database.collections}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Data Size</span>
                                    <span>{formatBytes(stats.database.dataSize)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Storage Size</span>
                                    <span>{formatBytes(stats.database.storageSize)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Indexes</span>
                                    <span>{stats.database.indexes}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Index Size</span>
                                    <span>{formatBytes(stats.database.indexSize)}</span>
                                </StatRow>
                            </StatCardBody>
                        </StatCard>
                    )}

                    {/* Network */}
                    {ping && (
                        <StatCard $status={ping.responseTime < 100 ? 'success' : ping.responseTime < 300 ? 'warning' : 'error'}>
                            <StatCardHeader>
                                <span className="material-symbols-outlined">network_ping</span>
                                Network
                            </StatCardHeader>
                            <StatCardBody>
                                <StatRow>
                                    <span>Latency</span>
                                    <PingIndicator $latency={ping.responseTime}>
                                        <span>{ping.responseTime}ms</span>
                                    </PingIndicator>
                                </StatRow>
                                <StatRow>
                                    <span>Status</span>
                                    <StatusBadge $status="healthy">
                                        <span className="material-symbols-outlined">check</span>
                                        Connected
                                    </StatusBadge>
                                </StatRow>
                                <StatRow>
                                    <span>Last Ping</span>
                                    <span>{new Date(ping.timestamp).toLocaleTimeString()}</span>
                                </StatRow>
                            </StatCardBody>
                        </StatCard>
                    )}
                </StatsGrid>
            </ServerBody>
        </ServerContainer>
    );
};

export default Server;