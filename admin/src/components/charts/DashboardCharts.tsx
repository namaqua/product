import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from 'recharts';

// Color palette for charts
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray: '#6B7280',
  navy: '#1E293B',
  accent: '#06B6D4',
};

export const CHART_GRADIENT_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#06B6D4',
  '#14B8A6',
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Revenue trend chart
export const RevenueTrendChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="month" 
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={CHART_COLORS.primary}
          fill="url(#colorRevenue)"
          strokeWidth={2}
          name="Revenue"
        />
        <Area
          type="monotone"
          dataKey="profit"
          stroke={CHART_COLORS.success}
          fill="url(#colorProfit)"
          strokeWidth={2}
          name="Profit"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Product category distribution chart
export const CategoryDistributionChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_GRADIENT_COLORS[index % CHART_GRADIENT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Sales performance bar chart
export const SalesPerformanceChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="day" 
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="sales" fill={CHART_COLORS.primary} radius={[8, 8, 0, 0]} name="Sales" />
        <Bar dataKey="orders" fill={CHART_COLORS.secondary} radius={[8, 8, 0, 0]} name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Inventory status radial chart
export const InventoryStatusChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={data}>
        <RadialBar
          minAngle={15}
          label={{ position: 'insideStart', fill: '#fff' }}
          background
          clockWise
          dataKey="value"
        />
        <Legend />
        <Tooltip content={<CustomTooltip />} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

// Product performance line chart
export const ProductPerformanceChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="views" 
          stroke={CHART_COLORS.primary} 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Views"
        />
        <Line 
          type="monotone" 
          dataKey="conversions" 
          stroke={CHART_COLORS.success} 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Conversions"
        />
        <Line 
          type="monotone" 
          dataKey="addToCart" 
          stroke={CHART_COLORS.warning} 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Add to Cart"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Composed chart for complex metrics
export const MetricsOverviewChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="month" 
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis 
          yAxisId="left"
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          className="text-xs"
          tick={{ fill: '#9CA3AF' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="revenue"
          fill={CHART_COLORS.primary}
          stroke={CHART_COLORS.primary}
          fillOpacity={0.3}
          name="Revenue"
        />
        <Bar 
          yAxisId="left"
          dataKey="products" 
          fill={CHART_COLORS.secondary}
          name="Products Added"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="growthRate"
          stroke={CHART_COLORS.success}
          strokeWidth={2}
          name="Growth Rate %"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// Mini sparkline chart for inline stats
export const SparklineChart = ({ data, color = CHART_COLORS.primary }: { data: any[], color?: string }) => {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Activity heatmap component
export const ActivityHeatmap = ({ data }: { data: any[] }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getIntensity = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (value < 25) return 'bg-blue-200 dark:bg-blue-900';
    if (value < 50) return 'bg-blue-400 dark:bg-blue-700';
    if (value < 75) return 'bg-blue-600 dark:bg-blue-500';
    return 'bg-blue-800 dark:bg-blue-400';
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-25 gap-1">
          <div></div>
          {hours.map(hour => (
            <div key={hour} className="text-xs text-gray-500 text-center">
              {hour}
            </div>
          ))}
          {days.map(day => (
            <>
              <div key={`label-${day}`} className="text-xs text-gray-500 pr-2">
                {day}
              </div>
              {hours.map(hour => {
                const value = data.find(d => d.day === day && d.hour === hour)?.value || 0;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`w-4 h-4 rounded-sm ${getIntensity(value)}`}
                    title={`${day} ${hour}:00 - ${value} activities`}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};
