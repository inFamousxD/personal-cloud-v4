import { useState, useEffect } from 'react';
import { serverApi, HealthResponse, ServerStats, PingResponse, ProcessInfo } from '../../../services/serverApi';
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
    // ProgressBar,
    ProgressFill,
    StatusBadge,
    LoadingState,
    ErrorState,
    PingIndicator,
    DockerControls,
    ActionButton,
    ClearCacheButton,
    SectionDivider,
    ProcessTable,
    ProcessTableHeader,
    ProcessTableRow,
    ProcessTableCell,
    SystemOverview,
    ResourceBar,
    ResourceLabel,
    ResourceValue,
    ProcessName,
    ProcessStats,
    SearchBar,
    SortButton
} from './Server.styles';

type SortField = 'pid' | 'user' | 'name' | 'cpu' | 'memory' | 'memoryMB' | 'status';
type SortOrder = 'asc' | 'desc';

const Server = () => {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [ping, setPing] = useState<PingResponse | null>(null);
    const [affineStatus, setAffineStatus] = useState<AffineStatus | null>(null);
    const [affineStats, setAffineStats] = useState<AffineStats | null>(null);
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [filteredProcesses, setFilteredProcesses] = useState<ProcessInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('cpu');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadServerData();
        const interval = setInterval(loadServerData, 30000);
        console.log(affineStats)
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Filter processes based on search query
        let filtered = processes;
        
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = processes.filter(proc => 
                proc.name.toLowerCase().includes(query) ||
                proc.command.toLowerCase().includes(query) ||
                proc.user.toLowerCase().includes(query) ||
                proc.pid.toString().includes(query)
            );
        }

        // Sort processes
        filtered.sort((a, b) => {
            let aVal: any = a[sortField];
            let bVal: any = b[sortField];

            // For numeric fields, compare as numbers
            if (sortField === 'pid' || sortField === 'cpu' || sortField === 'memory' || sortField === 'memoryMB') {
                aVal = Number(aVal);
                bVal = Number(bVal);
            } else {
                // Convert strings to lowercase for case-insensitive sorting
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredProcesses(filtered);
    }, [searchQuery, processes, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle order if clicking the same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to descending for numbers, ascending for strings
            setSortField(field);
            setSortOrder(field === 'user' || field === 'name' || field === 'status' ? 'asc' : 'desc');
        }
    };

    const loadServerData = async () => {
        try {
            setError(null);
            const isInitialLoad = loading;
            if (!isInitialLoad) setRefreshing(true);

            const [healthData, statsData, pingData, processesData, affineStatusData, affineStatsData] = await Promise.all([
                serverApi.getHealth(),
                serverApi.getStats(),
                serverApi.ping(),
                serverApi.getProcesses(),
                affineApi.getStatus().catch(() => null),
                affineApi.getStats().catch(() => null)
            ]);

            setHealth(healthData);
            setStats(statsData);
            setPing(pingData);
            setProcesses(processesData.processes);
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
            await new Promise(resolve => setTimeout(resolve, 2000));
            await loadServerData();
        } catch (error: any) {
            console.error('Error starting Affine:', error);
            alert(`Failed to start Affine server: ${error.response?.data?.message || error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAffineStop = async () => {
        if (!confirm('Are you sure you want to stop the Affine server?')) return;
        
        try {
            setActionLoading('stop');
            await affineApi.stop();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await loadServerData();
        } catch (error: any) {
            console.error('Error stopping Affine:', error);
            alert(`Failed to stop Affine server: ${error.response?.data?.message || error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAffineRestart = async () => {
        try {
            setActionLoading('restart');
            await affineApi.restart();
            await new Promise(resolve => setTimeout(resolve, 2000));
            await loadServerData();
        } catch (error: any) {
            console.error('Error restarting Affine:', error);
            alert(`Failed to restart Affine server: ${error.response?.data?.message || error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearCache = async () => {
        if (!confirm('Clear system cache? This will free up memory but may temporarily slow down applications.')) return;
        
        try {
            setActionLoading('cache');
            const result = await affineApi.clearCache();
            alert(`Cache cleared successfully!\n\nBefore:\n${result.before}\n\nAfter:\n${result.after}`);
            await loadServerData();
        } catch (error: any) {
            console.error('Error clearing cache:', error);
            const errorMsg = error.response?.data?.details || error.response?.data?.message || error.message;
            alert(`Failed to clear cache:\n\n${errorMsg}`);
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

    const getCpuColor = (percent: number): string => {
        if (percent < 50) return '#27AE60';
        if (percent < 80) return '#B95A1A';
        return '#e74c3c';
    };

    // const parseMemoryPercent = (percentStr: string): number => {
    //     return parseFloat(percentStr.replace('%', ''));
    // };

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
                    System Monitor
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
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                {/* System Overview */}
                <SystemOverview>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                        {/* Left column - System info */}
                        <div>
                            <StatRow style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                                    {stats?.system.hostname || 'System'} | Uptime: {stats?.system ? formatUptime(stats.system.uptime) : 'N/A'}
                                </span>
                            </StatRow>
                            
                            {/* CPU Usage */}
                            {stats?.system && (
                                <div style={{ marginBottom: '12px' }}>
                                    <ResourceLabel>
                                        <span>CPU [{stats.system.cpuCount} cores]</span>
                                        <ResourceValue>{stats.system.cpuUsagePercent.toFixed(1)}%</ResourceValue>
                                    </ResourceLabel>
                                    <ResourceBar>
                                        <ProgressFill 
                                            $percent={stats.system.cpuUsagePercent}
                                            $color={getCpuColor(stats.system.cpuUsagePercent)}
                                        />
                                    </ResourceBar>
                                </div>
                            )}

                            {/* Memory Usage */}
                            {stats?.system && (
                                <div style={{ marginBottom: '12px' }}>
                                    <ResourceLabel>
                                        <span>Memory</span>
                                        <ResourceValue>
                                            {formatBytes(stats.system.usedMemory)} / {formatBytes(stats.system.totalMemory)}
                                        </ResourceValue>
                                    </ResourceLabel>
                                    <ResourceBar>
                                        <ProgressFill 
                                            $percent={parseFloat(stats.system.memoryUsagePercent)}
                                            $color={getMemoryColor(parseFloat(stats.system.memoryUsagePercent))}
                                        />
                                    </ResourceBar>
                                </div>
                            )}
                        </div>

                        {/* Right column - Docker controls */}
                        <div>
                            <StatRow style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                                    Affine Docker Compose Server
                                </span>
                                {affineStatus && (
                                    <StatusBadge $status={affineStatus.running ? 'healthy' : 'unhealthy'}>
                                        <span className="material-symbols-outlined">
                                            {affineStatus.running ? 'check_circle' : 'cancel'}
                                        </span>
                                        {affineStatus.running ? 'Running' : 'Stopped'}
                                    </StatusBadge>
                                )}
                            </StatRow>
                            
                            <DockerControls style={{ marginTop: '8px', flexDirection: 'column' }}>
                                <ActionButton 
                                    onClick={handleAffineStart}
                                    disabled={actionLoading !== null || (affineStatus?.running === true)}
                                    $variant="success"
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    Start
                                </ActionButton>
                                <ActionButton 
                                    onClick={handleAffineStop}
                                    disabled={actionLoading !== null || !affineStatus?.running}
                                    $variant="error"
                                >
                                    <span className="material-symbols-outlined">stop</span>
                                    Stop
                                </ActionButton>
                                <ActionButton 
                                    onClick={handleAffineRestart}
                                    disabled={actionLoading !== null || !affineStatus?.running}
                                    $variant="warning"
                                >
                                    <span className="material-symbols-outlined">restart_alt</span>
                                    Restart
                                </ActionButton>
                            </DockerControls>

                            {affineStatus && affineStatus.containers.length > 0 && (
                                <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.7 }}>
                                    {affineStatus.runningContainers}/{affineStatus.totalContainers} containers running
                                </div>
                            )}
                        </div>
                    </div>
                </SystemOverview>

                {/* Process Table */}
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <SectionDivider style={{ margin: 0, border: 'none', paddingBottom: 0 }}>
                        Processes ({filteredProcesses.length})
                    </SectionDivider>
                    <SearchBar
                        type="text"
                        placeholder="Search processes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <ProcessTable>
                    <ProcessTableHeader>
                        <ProcessTableCell style={{ width: '7%' }}>
                            <SortButton onClick={() => handleSort('pid')} $active={sortField === 'pid'}>
                                PID
                                <span className="material-symbols-outlined">
                                    {sortField === 'pid' && sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                            </SortButton>
                        </ProcessTableCell>
                        <ProcessTableCell style={{ width: '10%' }}>
                            <SortButton onClick={() => handleSort('user')} $active={sortField === 'user'}>
                                USER
                                <span className="material-symbols-outlined">
                                    {sortField === 'user' && sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                            </SortButton>
                        </ProcessTableCell>
                        <ProcessTableCell style={{ width: '38%' }}>
                            <SortButton onClick={() => handleSort('name')} $active={sortField === 'name'}>
                                PROCESS
                                <span className="material-symbols-outlined">
                                    {sortField === 'name' && sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                            </SortButton>
                        </ProcessTableCell>
                        <ProcessTableCell style={{ width: '10%' }}>
                            <SortButton onClick={() => handleSort('cpu')} $active={sortField === 'cpu'}>
                                CPU %
                                <span className="material-symbols-outlined">
                                    {sortField === 'cpu' && sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                            </SortButton>
                        </ProcessTableCell>
                        <ProcessTableCell style={{ width: '10%' }}>
                            <SortButton onClick={() => handleSort('memory')} $active={sortField === 'memory'}>
                                MEM %
                                <span className="material-symbols-outlined">
                                    {sortField === 'memory' && sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                            </SortButton>
                        </ProcessTableCell>
                        <ProcessTableCell style={{ width: '12%' }}>
                            <SortButton onClick={() => handleSort('memoryMB')} $active={sortField === 'memoryMB'}>
                                MEM (MB)
                                <span className="material-symbols-outlined">
                                    {sortField === 'memoryMB' && sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                            </SortButton>
                        </ProcessTableCell>
                        <ProcessTableCell style={{ width: '13%' }}>
                            <SortButton onClick={() => handleSort('status')} $active={sortField === 'status'}>
                                STATUS
                                <span className="material-symbols-outlined">
                                    {sortField === 'status' && sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                </span>
                            </SortButton>
                        </ProcessTableCell>
                    </ProcessTableHeader>

                    {filteredProcesses.slice(0, 50).map((proc) => (
                        <ProcessTableRow key={proc.pid}>
                            <ProcessTableCell style={{ width: '7%' }}>
                                {proc.pid}
                            </ProcessTableCell>
                            <ProcessTableCell style={{ width: '10%' }}>
                                {proc.user}
                            </ProcessTableCell>
                            <ProcessTableCell style={{ width: '38%' }}>
                                <ProcessName>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                        terminal
                                    </span>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{proc.name}</div>
                                        <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {proc.command}
                                        </div>
                                    </div>
                                </ProcessName>
                            </ProcessTableCell>
                            <ProcessTableCell style={{ width: '10%' }}>
                                <ProcessStats $value={proc.cpu} $type="cpu">
                                    {proc.cpu.toFixed(1)}%
                                </ProcessStats>
                            </ProcessTableCell>
                            <ProcessTableCell style={{ width: '10%' }}>
                                <ProcessStats $value={proc.memory} $type="memory">
                                    {proc.memory.toFixed(1)}%
                                </ProcessStats>
                            </ProcessTableCell>
                            <ProcessTableCell style={{ width: '12%' }}>
                                {proc.memoryMB.toFixed(0)} MB
                            </ProcessTableCell>
                            <ProcessTableCell style={{ width: '13%' }}>
                                <span style={{ fontSize: '10px', opacity: 0.6 }}>
                                    {proc.status}
                                </span>
                            </ProcessTableCell>
                        </ProcessTableRow>
                    ))}

                    {filteredProcesses.length === 0 && (
                        <ProcessTableRow>
                            <ProcessTableCell style={{ width: '100%', textAlign: 'center', opacity: 0.5 }}>
                                No processes found matching "{searchQuery}"
                            </ProcessTableCell>
                        </ProcessTableRow>
                    )}
                </ProcessTable>

                {/* Additional Stats */}
                <SectionDivider>System Details</SectionDivider>
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
                        </StatCardBody>
                    </StatCard>

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
                                    <span>{stats.system.platform} {stats.system.arch}</span>
                                </StatRow>
                                <StatRow>
                                    <span>CPU Model</span>
                                    <span style={{ fontSize: '10px' }}>{stats.system.cpuModel}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Node Version</span>
                                    <span>{stats.process.nodeVersion}</span>
                                </StatRow>
                            </StatCardBody>
                        </StatCard>
                    )}

                    {/* Database Storage */}
                    {stats?.database && (
                        <StatCard>
                            <StatCardHeader>
                                <span className="material-symbols-outlined">storage</span>
                                Database
                            </StatCardHeader>
                            <StatCardBody>
                                <StatRow>
                                    <span>Data Size</span>
                                    <span>{formatBytes(stats.database.dataSize)}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Collections</span>
                                    <span>{stats.database.collections}</span>
                                </StatRow>
                                <StatRow>
                                    <span>Indexes</span>
                                    <span>{stats.database.indexes}</span>
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