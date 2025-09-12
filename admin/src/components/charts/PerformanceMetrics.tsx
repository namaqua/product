import { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  ServerIcon,
  CircleStackIcon,
  BoltIcon,
  CloudIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { SparklineChart } from './DashboardCharts';

interface SystemMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  status: 'healthy' | 'warning' | 'critical';
  sparklineData?: { value: number }[];
}

interface PerformanceData {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    in: number;
    out: number;
  };
  database: {
    connections: number;
    queryTime: number;
    cacheHitRate: number;
  };
  api: {
    avgResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    uptime: number;
  };
}

// Generate mock sparkline data
const generateSparklineData = (baseValue: number, variance: number = 10) => {
  return Array.from({ length: 20 }, () => ({
    value: baseValue + (Math.random() - 0.5) * variance
  }));
};

// Generate mock performance data
const generatePerformanceData = (): PerformanceData => {
  return {
    cpu: Math.random() * 100,
    memory: 45 + Math.random() * 30,
    disk: 30 + Math.random() * 40,
    network: {
      in: Math.random() * 100,
      out: Math.random() * 50,
    },
    database: {
      connections: Math.floor(10 + Math.random() * 40),
      queryTime: Math.random() * 100,
      cacheHitRate: 85 + Math.random() * 10,
    },
    api: {
      avgResponseTime: 50 + Math.random() * 200,
      requestsPerSecond: Math.floor(100 + Math.random() * 500),
      errorRate: Math.random() * 5,
      uptime: 99.5 + Math.random() * 0.49,
    },
  };
};

export const PerformanceMetrics = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>(generatePerformanceData());
  const [isRealTime, setIsRealTime] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTime) return;
    
    const interval = setInterval(() => {
      setPerformanceData(generatePerformanceData());
    }, 5000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  const getStatus = (value: number, thresholds: { warning: number; critical: number }): 'healthy' | 'warning' | 'critical' => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  const systemMetrics: SystemMetric[] = [
    {
      label: 'CPU Usage',
      value: performanceData.cpu.toFixed(1),
      unit: '%',
      trend: performanceData.cpu > 50 ? 'up' : 'down',
      trendValue: '2.3%',
      status: getStatus(performanceData.cpu, { warning: 70, critical: 90 }),
      sparklineData: generateSparklineData(performanceData.cpu, 15),
    },
    {
      label: 'Memory Usage',
      value: performanceData.memory.toFixed(1),
      unit: '%',
      trend: performanceData.memory > 60 ? 'up' : 'stable',
      trendValue: '1.2%',
      status: getStatus(performanceData.memory, { warning: 75, critical: 90 }),
      sparklineData: generateSparklineData(performanceData.memory, 10),
    },
    {
      label: 'Disk Usage',
      value: performanceData.disk.toFixed(1),
      unit: '%',
      trend: 'stable',
      trendValue: '0.5%',
      status: getStatus(performanceData.disk, { warning: 80, critical: 95 }),
      sparklineData: generateSparklineData(performanceData.disk, 5),
    },
    {
      label: 'Network I/O',
      value: `${performanceData.network.in.toFixed(0)}/${performanceData.network.out.toFixed(0)}`,
      unit: 'MB/s',
      trend: 'up',
      trendValue: '15%',
      status: 'healthy',
      sparklineData: generateSparklineData((performanceData.network.in + performanceData.network.out) / 2, 20),
    },
  ];

  const databaseMetrics = [
    {
      icon: CircleStackIcon,
      label: 'Active Connections',
      value: performanceData.database.connections,
      max: 100,
      percentage: (performanceData.database.connections / 100) * 100,
    },
    {
      icon: ClockIcon,
      label: 'Avg Query Time',
      value: `${performanceData.database.queryTime.toFixed(1)}ms`,
      max: null,
      percentage: null,
    },
    {
      icon: BoltIcon,
      label: 'Cache Hit Rate',
      value: `${performanceData.database.cacheHitRate.toFixed(1)}%`,
      max: null,
      percentage: performanceData.database.cacheHitRate,
    },
  ];

  const apiMetrics = [
    {
      label: 'Response Time',
      value: performanceData.api.avgResponseTime.toFixed(0),
      unit: 'ms',
      target: '< 200ms',
      isGood: performanceData.api.avgResponseTime < 200,
    },
    {
      label: 'Requests/sec',
      value: performanceData.api.requestsPerSecond,
      unit: '',
      target: '> 100',
      isGood: performanceData.api.requestsPerSecond > 100,
    },
    {
      label: 'Error Rate',
      value: performanceData.api.errorRate.toFixed(2),
      unit: '%',
      target: '< 1%',
      isGood: performanceData.api.errorRate < 1,
    },
    {
      label: 'Uptime',
      value: performanceData.api.uptime.toFixed(2),
      unit: '%',
      target: '> 99.9%',
      isGood: performanceData.api.uptime > 99.9,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Performance</h3>
        <button
          onClick={() => setIsRealTime(!isRealTime)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            isRealTime
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {isRealTime ? '● Live' : '○ Paused'}
        </button>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {metric.label}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                  {metric.unit}
                </span>
              </span>
              {metric.trend && (
                <div className="flex items-center text-sm">
                  {metric.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  ) : metric.trend === 'down' ? (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
                  ) : null}
                  <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {metric.trendValue}
                  </span>
                </div>
              )}
            </div>
            {metric.sparklineData && (
              <div className="h-10">
                <SparklineChart
                  data={metric.sparklineData}
                  color={
                    metric.status === 'critical' ? '#EF4444' :
                    metric.status === 'warning' ? '#F59E0B' : '#10B981'
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Database & API Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <CircleStackIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Database Performance</h4>
          </div>
          <div className="space-y-4">
            {databaseMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metric.value}
                  </span>
                </div>
                {metric.percentage !== null && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.percentage > 80 ? 'bg-red-500' :
                        metric.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* API Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <CloudIcon className="w-5 h-5 text-gray-400 mr-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">API Performance</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {apiMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    {metric.unit}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metric.label}
                </div>
                <div className={`text-xs mt-1 ${metric.isGood ? 'text-green-600' : 'text-yellow-600'}`}>
                  {metric.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Server Health Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <ServerIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              All Systems Operational
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Last checked: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
