import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  DollarSign,
  Zap,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

const COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

const UsageDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [usageData, setUsageData] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customRange, setCustomRange] = useState(false);

  useEffect(() => {
    fetchUsageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (customRange && startDate) {
      return {
        startDate,
        endDate: endDate || today,
      };
    }

    let start = new Date(now);
    switch (timeRange) {
      case '24hours':
        start.setDate(start.getDate() - 1);
        break;
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: today,
    };
  };

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const response = await api.get('/usage/summary', {
        params: {
          startDate,
          endDate,
          groupBy: 'model',
        },
      });
      setUsageData(response.data);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRangeApply = () => {
    if (startDate) {
      setCustomRange(true);
      fetchUsageData();
    }
  };

  const formatCost = (cost) => {
    if (cost === null || cost === undefined) return '$0.00';
    return `$${cost.toFixed(4)}`;
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  const prepareChartData = () => {
    if (!usageData?.aggregated?.byDate) return [];

    return Object.entries(usageData.aggregated.byDate)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.inputTokens + data.outputTokens,
        cost: data.cost,
        requests: data.requests,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const prepareModelData = () => {
    if (!usageData?.aggregated?.byModel) return [];

    return Object.entries(usageData.aggregated.byModel).map(
      ([model, data]) => ({
        name: model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.inputTokens + data.outputTokens,
        cost: data.cost,
        requests: data.requests,
      })
    );
  };

  const aggregated = usageData?.aggregated;

  return (
    <div className='space-y-6'>
      {/* Header with Filters */}
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900'>
            OpenAI Usage Analytics
          </h2>
          <p className='text-slate-600 mt-1'>
            Track your API usage and costs in real-time
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          {/* Quick Time Range Buttons */}
          <div className='flex gap-2'>
            <Button
              variant={
                timeRange === '24hours' && !customRange ? 'primary' : 'ghost'
              }
              size='sm'
              onClick={() => {
                setTimeRange('24hours');
                setCustomRange(false);
              }}>
              24h
            </Button>
            <Button
              variant={
                timeRange === '7days' && !customRange ? 'primary' : 'ghost'
              }
              size='sm'
              onClick={() => {
                setTimeRange('7days');
                setCustomRange(false);
              }}>
              7d
            </Button>
            <Button
              variant={
                timeRange === '30days' && !customRange ? 'primary' : 'ghost'
              }
              size='sm'
              onClick={() => {
                setTimeRange('30days');
                setCustomRange(false);
              }}>
              30d
            </Button>
            <Button
              variant={
                timeRange === '90days' && !customRange ? 'primary' : 'ghost'
              }
              size='sm'
              onClick={() => {
                setTimeRange('90days');
                setCustomRange(false);
              }}>
              90d
            </Button>
          </div>

          {/* Custom Date Range */}
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-slate-400' />
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
              placeholder='Start'
            />
            <span className='text-slate-500 text-sm'>to</span>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
              placeholder='End'
            />
            <Button
              size='sm'
              onClick={handleCustomRangeApply}
              disabled={!startDate}>
              Apply
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            variant='ghost'
            size='sm'
            onClick={fetchUsageData}
            disabled={loading}
            icon={
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
            }>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent'></div>
        </div>
      ) : aggregated ? (
        <>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-medium text-emerald-600 mb-1'>
                    Total Tokens
                  </p>
                  <p className='text-2xl font-bold text-emerald-900'>
                    {formatNumber(
                      aggregated.totalInputTokens + aggregated.totalOutputTokens
                    )}
                  </p>
                  <p className='text-xs text-emerald-700 mt-1'>
                    {formatNumber(aggregated.totalInputTokens)} in /{' '}
                    {formatNumber(aggregated.totalOutputTokens)} out
                  </p>
                </div>
                <div className='p-3 bg-emerald-200 rounded-lg'>
                  <Zap className='w-6 h-6 text-emerald-700' />
                </div>
              </div>
            </Card>

            <Card className='bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-medium text-blue-600 mb-1'>
                    Cached Tokens
                  </p>
                  <p className='text-2xl font-bold text-blue-900'>
                    {formatNumber(aggregated.totalInputCachedTokens)}
                  </p>
                  <p className='text-xs text-blue-700 mt-1'>
                    Reduced cost input
                  </p>
                </div>
                <div className='p-3 bg-blue-200 rounded-lg'>
                  <TrendingUp className='w-6 h-6 text-blue-700' />
                </div>
              </div>
            </Card>

            <Card className='bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-medium text-purple-600 mb-1'>
                    Total Requests
                  </p>
                  <p className='text-2xl font-bold text-purple-900'>
                    {formatNumber(aggregated.totalRequests)}
                  </p>
                  <p className='text-xs text-purple-700 mt-1'>API calls made</p>
                </div>
                <div className='p-3 bg-purple-200 rounded-lg'>
                  <Activity className='w-6 h-6 text-purple-700' />
                </div>
              </div>
            </Card>

            <Card className='bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs font-medium text-rose-600 mb-1'>
                    Total Cost
                  </p>
                  <p className='text-2xl font-bold text-rose-900'>
                    {formatCost(aggregated.totalCost)}
                  </p>
                  <p className='text-xs text-rose-700 mt-1'>From OpenAI API</p>
                </div>
                <div className='p-3 bg-rose-200 rounded-lg'>
                  <DollarSign className='w-6 h-6 text-rose-700' />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Token Usage Over Time */}
            <Card>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>
                Token Usage Over Time
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type='monotone'
                    dataKey='inputTokens'
                    stackId='1'
                    stroke='#10b981'
                    fill='#10b981'
                    fillOpacity={0.6}
                    name='Input Tokens'
                  />
                  <Area
                    type='monotone'
                    dataKey='outputTokens'
                    stackId='1'
                    stroke='#3b82f6'
                    fill='#3b82f6'
                    fillOpacity={0.6}
                    name='Output Tokens'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Cost Over Time */}
            <Card>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>
                Cost Over Time
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCost(value)} />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='cost'
                    stroke='#ef4444'
                    strokeWidth={2}
                    name='Cost ($)'
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Requests Over Time */}
            <Card>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>
                API Requests Over Time
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='requests' fill='#8b5cf6' name='Requests' />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Model Distribution */}
            <Card>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>
                Usage by Model
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={prepareModelData()}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='totalTokens'>
                    {prepareModelData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Model Breakdown Table */}
          {prepareModelData().length > 0 && (
            <Card>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>
                Model Breakdown
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-slate-200'>
                      <th className='text-left py-3 px-4 text-sm font-semibold text-slate-700'>
                        Model
                      </th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-slate-700'>
                        Input Tokens
                      </th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-slate-700'>
                        Output Tokens
                      </th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-slate-700'>
                        Total Tokens
                      </th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-slate-700'>
                        Requests
                      </th>
                      <th className='text-right py-3 px-4 text-sm font-semibold text-slate-700'>
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prepareModelData().map((model, index) => (
                      <tr
                        key={model.name}
                        className='border-b border-slate-100 hover:bg-slate-50 transition-colors'>
                        <td className='py-3 px-4'>
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-3 h-3 rounded-full'
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span className='font-medium text-slate-900'>
                              {model.name}
                            </span>
                          </div>
                        </td>
                        <td className='py-3 px-4 text-right text-slate-700'>
                          {formatNumber(model.inputTokens)}
                        </td>
                        <td className='py-3 px-4 text-right text-slate-700'>
                          {formatNumber(model.outputTokens)}
                        </td>
                        <td className='py-3 px-4 text-right font-medium text-slate-900'>
                          {formatNumber(model.totalTokens)}
                        </td>
                        <td className='py-3 px-4 text-right text-slate-700'>
                          {formatNumber(model.requests)}
                        </td>
                        <td className='py-3 px-4 text-right font-medium text-emerald-700'>
                          {formatCost(model.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <div className='text-center py-12'>
            <Activity className='w-12 h-12 text-slate-300 mx-auto mb-3' />
            <p className='text-slate-500'>No usage data available</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UsageDashboard;
