import { useState, useEffect } from 'react';
import { serverApi, HealthResponse, ServerStats, PingResponse } from '../../../services/serverApi';
import affineApi, { AffineStatus, AffineStats } from '../../../services/affineApi';
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
    PingIndicator,
    AffineSection,
    AffineControls,
    ActionButton,
    ClearCacheButton,
    SectionDivider
} from './Server.styles';

const Server = () => {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [ping, setPing] = useState<PingResponse | null>(null);
    const [affineStatus, setAffineStatus] = useState<AffineStatus | null>(null);
    const [affineStats, setAffineStats] = useState<AffineStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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

            const [healthData, statsData, pingData, affineStatusData, affineStatsData] = await Promise.all([
                serverApi.getHealth(),
                serverApi.getStats(),
                serverApi.ping(),
                affineApi.getStatus().catch(() => null),
                affineApi.getStats().catch(() => null)
            ]);

            setHealth(healthData);
            setStats(statsData);
            setPing(pingData);
            setAffineStatus(affineStatusData);
            setAffineStats(affineStatsData);
        } catch (error) {
            console.error('Error loading server data:', error);
            setError('Failed to load server data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAffineStart = async () => {
        try {
            setActionLoading('start');
            await affineApi.start();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await loadServerData();
        } catch (error) {
            console.error('Error starting Affine:', error);
            alert('Failed to start Affine server');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAffineStop = async () => {
        if (!confirm('Are you sure you want to stop the Affine server?')) return;
        
        try {
            setActionLoading('stop');
            await affineApi.stop();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await loadServerData();
        } catch (error) {
            console.error('Error stopping Affine:', error);
            alert('Failed to stop Affine server');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAffineRestart = async () => {
        try {
            setActionLoading('restart');
            await affineApi.restart();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await loadServerData();
        } catch (error) {
            console.error('Error restarting Affine:', error);
            alert('Failed to restart Affine server');
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearCache = async () => {
        if (!confirm('Clear system cache? This will free up memory.')) return;
        
        try {
            setActionLoading('cache');
            const result = await affineApi.clearCache();
            alert(`Cache cleared successfully!\n\nBefore:\n${result.before}\n\nAfter:\n${result.after}`);
            await loadServerData();
        } catch (error: any) {
            console.error('Error clearing cache:', error);
            alert(`Failed to clear cache: ${error.response?.data?.message || error.message}`);
        } finally {
            setActionLoading(null);
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

    const parseMemoryPercent = (percentStr: string): number => {
        return parseFloat(percentStr.replace('%', ''));
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                    <ClearCacheButton 
                        onClick={handleClearCache} 
                        disabled={actionLoading === 'cache'}
                    >
                        <span className="material-symbols-outlined">cleaning_services</span>
                        {actionLoading === 'cache' ? 'Clearing...' : 'Clear Cache'}
                    </ClearCacheButton>
                    <RefreshButton onClick={loadServerData} disabled={refreshing}>
                        <span className="material-symbols-outlined">refresh</span>
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </RefreshButton>
                </div>
            </ServerHeader>

            <ServerBody>
                {/* Affine Server Section - Always show if we attempted to fetch */}
                <AffineSection>
                    <StatCardHeader>
                        <span className="material-symbols-outlined">deployed_code</span>
                        Affine Server
                        {affineStatus && (
                            <StatusBadge $status={affineStatus.running ? 'healthy' : 'unhealthy'}>
                                <span className="material-symbols-outlined">
                                    {affineStatus.running ? 'check_circle' : 'cancel'}
                                </span>
                                {affineStatus.running ? 'Running' : 'Stopped'}
                            </StatusBadge>
                        )}
                        {!affineStatus && (
                            <StatusBadge $status="unhealthy">
                                <span className="material-symbols-outlined">help</span>
                                Unknown
                            </StatusBadge>
                        )}
                    </StatCardHeader>
                    
                    {!affineStatus && (
                        <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.7 }}>
                            Could not connect to Affine. Make sure:
                            <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                                <li>Affine directory exists at ../affine</li>
                                <li>Docker is installed and running</li>
                                <li>Backend has permissions to execute Docker commands</li>
                            </ul>
                        </div>
                    )}
                    
                    {affineStatus && (
                        <>
                            <AffineControls>
                                <ActionButton 
                                    onClick={handleAffineStart}
                                    disabled={affineStatus.running || actionLoading !== null}
                                    $variant="success"
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    {actionLoading === 'start' ? 'Starting...' : 'Start'}
                                </ActionButton>
                                <ActionButton 
                                    onClick={handleAffineStop}
                                    disabled={!affineStatus.running || actionLoading !== null}
                                    $variant="error"
                                >
                                    <span className="material-symbols-outlined">stop</span>
                                    {actionLoading === 'stop' ? 'Stopping...' : 'Stop'}
                                </ActionButton>
                                <ActionButton 
                                    onClick={handleAffineRestart}
                                    disabled={!affineStatus.running || actionLoading !== null}
                                    $variant="warning"
                                >
                                    <span className="material-symbols-outlined">restart_alt</span>
                                    {actionLoading === 'restart' ? 'Restarting...' : 'Restart'}
                                </ActionButton>
                            </AffineControls>

                            {affineStatus.containers.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
                                        Containers ({affineStatus.runningContainers}/{affineStatus.totalContainers} running)
                                    </div>
                                    {affineStatus.containers.map((container, idx) => (
                                        <StatRow key={idx}>
                                            <span>{container.name}</span>
                                            <StatusBadge $status={container.state === 'running' ? 'healthy' : 'unhealthy'}>
                                                {container.state}
                                            </StatusBadge>
                                        </StatRow>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </AffineSection>

                {/* Affine Container Stats */}
                {affineStats && affineStats.running && affineStats.containers.length > 0 && (
                    <>
                        <SectionDivider>Affine Resource Usage</SectionDivider>
                        <StatsGrid>
                            {affineStats.containers.map((container) => (
                                <StatCard key={container.containerId}>
                                    <StatCardHeader>
                                        <span className="material-symbols-outlined">inventory_2</span>
                                        {container.name}
                                    </StatCardHeader>
                                    <StatCardBody>
                                        <StatRow>
                                            <span>CPU</span>
                                            <span>{container.cpuPercent}</span>
                                        </StatRow>
                                        <StatRow>
                                            <span>Memory</span>
                                            <span>{container.memUsage} / {container.memLimit}</span>
                                        </StatRow>
                                        <ProgressBar>
                                            <ProgressFill 
                                                $percent={parseMemoryPercent(container.memPercent)}
                                                $color={getMemoryColor(parseMemoryPercent(container.memPercent))}
                                            />
                                        </ProgressBar>
                                        <StatRow>
                                            <span>Network I/O</span>
                                            <span style={{ fontSize: '10px' }}>{container.netIO}</span>
                                        </StatRow>
                                        <StatRow>
                                            <span>Block I/O</span>
                                            <span style={{ fontSize: '10px' }}>{container.blockIO}</span>
                                        </StatRow>
                                    </StatCardBody>
                                </StatCard>
                            ))}
                        </StatsGrid>
                    </>
                )}

                <SectionDivider>System Stats</SectionDivider>

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
