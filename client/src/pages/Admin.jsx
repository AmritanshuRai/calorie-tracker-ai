import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  LogOut,
  Activity,
  FileText,
  X,
  DollarSign,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useUserStore from '../stores/useUserStore';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import UsageDashboard from '../components/UsageDashboard';

const Admin = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  const [activeTab, setActiveTab] = useState('users');
  const [logsSubTab, setLogsSubTab] = useState('list'); // 'list' or 'visual'
  const [users, setUsers] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'logs' or 'onboarding'
  const [modalData, setModalData] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Date filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Check admin access and redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      // Silently redirect to dashboard without showing error
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'openailogs') {
      fetchAllLogs();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/openai-logs');
      setAllLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLogs = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users/${userId}/logs`);
      setModalData(response.data);
      setModalType('logs');
      setSelectedUser(users.find((u) => u.id === userId));
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOnboarding = async (userId) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/users/${userId}/onboarding`);
      setModalData(response.data);
      setModalType('onboarding');
      setSelectedUser(users.find((u) => u.id === userId));
    } catch (error) {
      console.error('Error fetching onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalData(null);
    setSelectedUser(null);
    setExpandedLogId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCost = (cost) => {
    if (!cost) return '$0.00';
    return `$${cost.toFixed(4)}`;
  };

  const toggleLogExpand = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  // Filter logs by date range
  const getFilteredLogs = () => {
    if (!allLogs || allLogs.length === 0) return [];

    let filtered = [...allLogs];

    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter((log) => new Date(log.createdAt) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((log) => new Date(log.createdAt) <= to);
    }

    return filtered;
  };

  // Calculate statistics totals
  const calculateTotals = () => {
    const filtered = getFilteredLogs();

    const totals = {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalInputCost: 0,
      totalOutputCost: 0,
      totalRequests: filtered.length,
    };

    filtered.forEach((log) => {
      totals.totalInputTokens += log.inputTokens || 0;
      totals.totalOutputTokens += log.outputTokens || 0;
      totals.totalInputCost += log.inputCost || 0;
      totals.totalOutputCost += log.outputCost || 0;
    });

    return totals;
  };

  // Prepare chart data
  const prepareChartData = () => {
    const filtered = getFilteredLogs();

    // Group by date
    const dataByDate = {};

    filtered.forEach((log) => {
      const date = new Date(log.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dataByDate[date]) {
        dataByDate[date] = {
          date,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          inputCost: 0,
          outputCost: 0,
          totalCost: 0,
        };
      }

      dataByDate[date].inputTokens += log.inputTokens || 0;
      dataByDate[date].outputTokens += log.outputTokens || 0;
      dataByDate[date].totalTokens += log.totalTokens || 0;
      dataByDate[date].inputCost += log.inputCost || 0;
      dataByDate[date].outputCost += log.outputCost || 0;
      dataByDate[date].totalCost += log.totalCost || 0;
    });

    return Object.values(dataByDate).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  };

  // Don't render anything if not admin (will redirect)
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <PageLayout>
      <div className='flex h-screen bg-slate-50'>
        {/* Sidebar */}
        <div className='w-56 bg-white border-r border-slate-200 flex flex-col flex-shrink-0'>
          <div className='p-6 border-b border-slate-200'>
            <h1 className='text-2xl font-bold text-slate-900'>Admin Panel</h1>
            <p className='text-sm text-slate-600 mt-1'>{user?.email}</p>
          </div>

          <nav className='flex-1 p-4 space-y-2'>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}>
              <Users className='w-5 h-5' />
              Users
            </button>
            <button
              onClick={() => setActiveTab('openailogs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'openailogs'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}>
              <Activity className='w-5 h-5' />
              OpenAI Logs
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'usage'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}>
              <TrendingUp className='w-5 h-5' />
              Usage Analytics
            </button>
          </nav>

          <div className='p-4 border-t border-slate-200'>
            <Button
              variant='ghost'
              size='sm'
              fullWidth
              onClick={handleLogout}
              icon={<LogOut className='w-4 h-4' />}>
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-auto'>
          <div className='w-full px-8 py-8'>
            {/* Header */}
            <div className='mb-8'>
              <h2 className='text-3xl font-bold text-slate-900'>
                {activeTab === 'users'
                  ? 'Users'
                  : activeTab === 'usage'
                  ? 'Usage Analytics'
                  : 'OpenAI Logs'}
              </h2>
              <p className='text-slate-600 mt-1'>
                {activeTab === 'users'
                  ? 'Manage and view all registered users'
                  : activeTab === 'usage'
                  ? 'View detailed OpenAI API usage and costs from OpenAI Usage API'
                  : 'View all OpenAI API calls and usage'}
              </p>
            </div>

            {/* Sub-tabs for OpenAI Logs */}
            {activeTab === 'openailogs' && (
              <div className='mb-6 flex items-center justify-between flex-wrap gap-4'>
                <div className='flex gap-2'>
                  <button
                    onClick={() => setLogsSubTab('list')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      logsSubTab === 'list'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    <div className='flex items-center gap-2'>
                      <Activity className='w-4 h-4' />
                      Logs List
                    </div>
                  </button>
                  <button
                    onClick={() => setLogsSubTab('visual')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      logsSubTab === 'visual'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    <div className='flex items-center gap-2'>
                      <BarChart3 className='w-4 h-4' />
                      Visual Analytics
                    </div>
                  </button>
                </div>

                {/* Date Filter */}
                <div className='flex items-center gap-3'>
                  <Calendar className='w-5 h-5 text-slate-400' />
                  <input
                    type='date'
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className='px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    placeholder='From'
                  />
                  <span className='text-slate-500'>to</span>
                  <input
                    type='date'
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className='px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    placeholder='To'
                  />
                  {(fromDate || toDate) && (
                    <button
                      onClick={() => {
                        setFromDate('');
                        setToDate('');
                      }}
                      className='text-sm text-slate-500 hover:text-slate-700'>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content based on active tab */}
            {loading ? (
              <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent'></div>
              </div>
            ) : activeTab === 'usage' ? (
              <UsageDashboard />
            ) : activeTab === 'users' ? (
              <Card>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-slate-200'>
                        <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700'>
                          User
                        </th>
                        <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700'>
                          Email
                        </th>
                        <th className='text-center py-4 px-6 text-sm font-semibold text-slate-700'>
                          Status
                        </th>
                        <th className='text-left py-4 px-6 text-sm font-semibold text-slate-700'>
                          Joined
                        </th>
                        <th className='text-center py-4 px-6 text-sm font-semibold text-slate-700'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className='border-b border-slate-100 hover:bg-slate-50 transition-colors'>
                          <td className='py-4 px-6'>
                            <div className='flex items-center gap-3'>
                              {user.picture ? (
                                <img
                                  src={user.picture}
                                  alt={user.name}
                                  className='w-10 h-10 rounded-full object-cover flex-shrink-0'
                                />
                              ) : (
                                <div className='w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0'>
                                  <span className='text-emerald-700 font-medium text-sm'>
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              )}
                              <div className='min-w-0'>
                                <p className='font-medium text-slate-900 truncate'>
                                  {user.name || 'Unknown'}
                                </p>
                                <p className='text-xs text-slate-500 truncate'>
                                  ID: {user.id.slice(0, 12)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className='py-4 px-6'>
                            <p className='text-slate-700 truncate'>
                              {user.email}
                            </p>
                          </td>
                          <td className='py-4 px-6 text-center'>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                user.profileCompleted
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                              {user.profileCompleted
                                ? 'Complete'
                                : 'Incomplete'}
                            </span>
                          </td>
                          <td className='py-4 px-6'>
                            <p className='text-sm text-slate-600 whitespace-nowrap'>
                              {formatDate(user.createdAt)}
                            </p>
                          </td>
                          <td className='py-4 px-6'>
                            <div className='flex gap-2 justify-center'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => fetchUserLogs(user.id)}
                                icon={<Activity className='w-4 h-4' />}>
                                Logs
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => fetchUserOnboarding(user.id)}
                                icon={<FileText className='w-4 h-4' />}>
                                Onboarding
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {users.length === 0 && (
                    <div className='text-center py-12'>
                      <Users className='w-12 h-12 text-slate-300 mx-auto mb-3' />
                      <p className='text-slate-500'>No users found</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : logsSubTab === 'list' ? (
              // OpenAI Logs List View
              <>
                {/* Statistics Summary */}
                {(() => {
                  const totals = calculateTotals();
                  return (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4'>
                      <Card className='bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 p-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-[10px] font-medium text-blue-600 mb-0.5'>
                              Total Input Tokens
                            </p>
                            <p className='text-xl font-bold text-blue-900'>
                              {totals.totalInputTokens.toLocaleString()}
                            </p>
                          </div>
                          <div className='p-2 bg-blue-200 rounded-lg'>
                            <Zap className='w-4 h-4 text-blue-700' />
                          </div>
                        </div>
                      </Card>

                      <Card className='bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 p-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-[10px] font-medium text-purple-600 mb-0.5'>
                              Total Output Tokens
                            </p>
                            <p className='text-xl font-bold text-purple-900'>
                              {totals.totalOutputTokens.toLocaleString()}
                            </p>
                          </div>
                          <div className='p-2 bg-purple-200 rounded-lg'>
                            <Zap className='w-4 h-4 text-purple-700' />
                          </div>
                        </div>
                      </Card>

                      <Card className='bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200 p-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-[10px] font-medium text-slate-600 mb-0.5'>
                              Total Tokens
                            </p>
                            <p className='text-xl font-bold text-slate-900'>
                              {(
                                totals.totalInputTokens +
                                totals.totalOutputTokens
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className='p-2 bg-slate-200 rounded-lg'>
                            <Zap className='w-4 h-4 text-slate-700' />
                          </div>
                        </div>
                      </Card>

                      <Card className='bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 p-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-[10px] font-medium text-emerald-600 mb-0.5'>
                              Total Input Cost
                            </p>
                            <p className='text-xl font-bold text-emerald-900'>
                              {formatCost(totals.totalInputCost)}
                            </p>
                          </div>
                          <div className='p-2 bg-emerald-200 rounded-lg'>
                            <DollarSign className='w-4 h-4 text-emerald-700' />
                          </div>
                        </div>
                      </Card>

                      <Card className='bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 p-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-[10px] font-medium text-amber-600 mb-0.5'>
                              Total Output Cost
                            </p>
                            <p className='text-xl font-bold text-amber-900'>
                              {formatCost(totals.totalOutputCost)}
                            </p>
                          </div>
                          <div className='p-2 bg-amber-200 rounded-lg'>
                            <DollarSign className='w-4 h-4 text-amber-700' />
                          </div>
                        </div>
                      </Card>

                      <Card className='bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200 p-3'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-[10px] font-medium text-rose-600 mb-0.5'>
                              Total Cost
                            </p>
                            <p className='text-xl font-bold text-rose-900'>
                              {formatCost(
                                totals.totalInputCost + totals.totalOutputCost
                              )}
                            </p>
                          </div>
                          <div className='p-2 bg-rose-200 rounded-lg'>
                            <DollarSign className='w-4 h-4 text-rose-700' />
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })()}

                {/* Logs List */}
                <div className='space-y-3'>
                  {(() => {
                    const filteredLogs = getFilteredLogs();
                    return filteredLogs && filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <Card
                          key={log.id}
                          className='hover:shadow-md transition-shadow p-4'>
                          <div
                            className='cursor-pointer'
                            onClick={() => toggleLogExpand(log.id)}>
                            <div className='flex items-start justify-between gap-4'>
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-2 flex-wrap'>
                                  <span className='px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded-full'>
                                    {log.model}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                      log.status === 'success'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {log.status}
                                  </span>
                                  <span className='text-[10px] text-slate-500'>
                                    {formatDate(log.createdAt)}
                                  </span>
                                </div>
                                <p className='text-slate-700 font-medium mb-2 line-clamp-1 text-sm'>
                                  {log.input}
                                </p>
                                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                                  <div className='flex items-center gap-2'>
                                    <Zap className='w-3.5 h-3.5 text-emerald-600 flex-shrink-0' />
                                    <div className='min-w-0'>
                                      <p className='text-[10px] text-slate-500'>
                                        Tokens
                                      </p>
                                      <p className='text-xs font-medium text-slate-900'>
                                        {log.totalTokens?.toLocaleString() || 0}
                                      </p>
                                    </div>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <DollarSign className='w-3.5 h-3.5 text-emerald-600 flex-shrink-0' />
                                    <div className='min-w-0'>
                                      <p className='text-[10px] text-slate-500'>
                                        Cost
                                      </p>
                                      <p className='text-xs font-medium text-slate-900'>
                                        {formatCost(log.totalCost)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <Clock className='w-3.5 h-3.5 text-emerald-600 flex-shrink-0' />
                                    <div className='min-w-0'>
                                      <p className='text-xs text-slate-500'>
                                        Time
                                      </p>
                                      <p className='text-sm font-medium text-slate-900'>
                                        {log.responseTimeMs}ms
                                      </p>
                                    </div>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                    <Activity className='w-4 h-4 text-emerald-600 flex-shrink-0' />
                                    <div className='min-w-0'>
                                      <p className='text-xs text-slate-500'>
                                        Effort
                                      </p>
                                      <p className='text-sm font-medium text-slate-900'>
                                        {log.reasoningEffort || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <button className='p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0'>
                                {expandedLogId === log.id ? (
                                  <ChevronUp className='w-5 h-5 text-slate-600' />
                                ) : (
                                  <ChevronDown className='w-5 h-5 text-slate-600' />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {expandedLogId === log.id && (
                            <div className='mt-3 pt-3 border-t border-slate-200 space-y-3'>
                              {log.errorMessage && (
                                <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                                  <p className='text-[10px] font-medium text-red-700 mb-1'>
                                    Error
                                  </p>
                                  <p className='text-xs text-red-600'>
                                    {log.errorMessage}
                                  </p>
                                </div>
                              )}
                              {log.rawOutput && (
                                <div className='bg-slate-50 border border-slate-200 rounded-lg p-3'>
                                  <p className='text-[10px] font-medium text-slate-700 mb-1'>
                                    Raw Output
                                  </p>
                                  <pre className='text-[10px] text-slate-600 overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto'>
                                    {JSON.stringify(
                                      JSON.parse(log.rawOutput),
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              )}
                              <div className='grid grid-cols-2 lg:grid-cols-3 gap-3 text-[10px] bg-slate-50 rounded-lg p-3'>
                                <div>
                                  <span className='text-slate-500'>
                                    Input Tokens:
                                  </span>
                                  <span className='ml-2 font-medium text-slate-900'>
                                    {log.inputTokens?.toLocaleString() || 0}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-slate-500'>
                                    Output Tokens:
                                  </span>
                                  <span className='ml-2 font-medium text-slate-900'>
                                    {log.outputTokens?.toLocaleString() || 0}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-slate-500'>
                                    Input Cost:
                                  </span>
                                  <span className='ml-2 font-medium text-slate-900'>
                                    {formatCost(log.inputCost)}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-slate-500'>
                                    Output Cost:
                                  </span>
                                  <span className='ml-2 font-medium text-slate-900'>
                                    {formatCost(log.outputCost)}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-slate-500'>
                                    Endpoint:
                                  </span>
                                  <span className='ml-2 font-medium text-slate-900 truncate'>
                                    {log.endpoint || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className='text-slate-500'>
                                    Request Type:
                                  </span>
                                  <span className='ml-2 font-medium text-slate-900'>
                                    {log.requestType}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))
                    ) : (
                      <div className='text-center py-12'>
                        <Activity className='w-12 h-12 text-slate-300 mx-auto mb-3' />
                        <p className='text-slate-500'>No logs found</p>
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              // Visual Analytics View
              <div className='space-y-6'>
                {allLogs && allLogs.length > 0 ? (
                  <>
                    {/* Input Tokens Over Time */}
                    <Card>
                      <h3 className='text-lg font-bold text-slate-900 mb-4'>
                        Input Tokens Over Time
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
                            stroke='#10b981'
                            fill='#10b981'
                            fillOpacity={0.6}
                            name='Input Tokens'
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Output Tokens Over Time */}
                    <Card>
                      <h3 className='text-lg font-bold text-slate-900 mb-4'>
                        Output Tokens Over Time
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
                            dataKey='outputTokens'
                            stroke='#3b82f6'
                            fill='#3b82f6'
                            fillOpacity={0.6}
                            name='Output Tokens'
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Total Tokens Over Time */}
                    <Card>
                      <h3 className='text-lg font-bold text-slate-900 mb-4'>
                        Total Tokens (Input + Output) Over Time
                      </h3>
                      <ResponsiveContainer width='100%' height={300}>
                        <LineChart data={prepareChartData()}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='date' />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type='monotone'
                            dataKey='inputTokens'
                            stroke='#10b981'
                            strokeWidth={2}
                            name='Input Tokens'
                          />
                          <Line
                            type='monotone'
                            dataKey='outputTokens'
                            stroke='#3b82f6'
                            strokeWidth={2}
                            name='Output Tokens'
                          />
                          <Line
                            type='monotone'
                            dataKey='totalTokens'
                            stroke='#8b5cf6'
                            strokeWidth={3}
                            name='Total Tokens'
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Input Cost Over Time */}
                    <Card>
                      <h3 className='text-lg font-bold text-slate-900 mb-4'>
                        Input Token Cost Over Time
                      </h3>
                      <ResponsiveContainer width='100%' height={300}>
                        <AreaChart data={prepareChartData()}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='date' />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => `$${value.toFixed(4)}`}
                          />
                          <Legend />
                          <Area
                            type='monotone'
                            dataKey='inputCost'
                            stroke='#f59e0b'
                            fill='#f59e0b'
                            fillOpacity={0.6}
                            name='Input Cost'
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Output Cost Over Time */}
                    <Card>
                      <h3 className='text-lg font-bold text-slate-900 mb-4'>
                        Output Token Cost Over Time
                      </h3>
                      <ResponsiveContainer width='100%' height={300}>
                        <AreaChart data={prepareChartData()}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='date' />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => `$${value.toFixed(4)}`}
                          />
                          <Legend />
                          <Area
                            type='monotone'
                            dataKey='outputCost'
                            stroke='#ef4444'
                            fill='#ef4444'
                            fillOpacity={0.6}
                            name='Output Cost'
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Total Cost Over Time */}
                    <Card>
                      <h3 className='text-lg font-bold text-slate-900 mb-4'>
                        Total Cost (Input + Output) Over Time
                      </h3>
                      <ResponsiveContainer width='100%' height={300}>
                        <LineChart data={prepareChartData()}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey='date' />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => `$${value.toFixed(4)}`}
                          />
                          <Legend />
                          <Line
                            type='monotone'
                            dataKey='inputCost'
                            stroke='#f59e0b'
                            strokeWidth={2}
                            name='Input Cost'
                          />
                          <Line
                            type='monotone'
                            dataKey='outputCost'
                            stroke='#ef4444'
                            strokeWidth={2}
                            name='Output Cost'
                          />
                          <Line
                            type='monotone'
                            dataKey='totalCost'
                            stroke='#dc2626'
                            strokeWidth={3}
                            name='Total Cost'
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </>
                ) : (
                  <div className='text-center py-12'>
                    <BarChart3 className='w-12 h-12 text-slate-300 mx-auto mb-3' />
                    <p className='text-slate-500'>
                      No data available for visualization
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50'>
              <div>
                <h3 className='text-2xl font-bold text-slate-900'>
                  {modalType === 'logs' ? 'OpenAI Logs' : 'Onboarding Data'}
                </h3>
                <p className='text-slate-600 mt-1'>
                  {selectedUser?.name} ({selectedUser?.email})
                </p>
              </div>
              <button
                onClick={closeModal}
                className='p-2 hover:bg-slate-200 rounded-lg transition-colors'>
                <X className='w-6 h-6 text-slate-600' />
              </button>
            </div>

            {/* Modal Content */}
            <div className='flex-1 overflow-auto p-6'>
              {loading ? (
                <div className='flex items-center justify-center h-64'>
                  <div className='animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent'></div>
                </div>
              ) : modalType === 'logs' ? (
                <div className='space-y-4'>
                  {modalData && modalData.length > 0 ? (
                    modalData.map((log) => (
                      <Card
                        key={log.id}
                        className='hover:shadow-md transition-shadow'>
                        <div
                          className='cursor-pointer'
                          onClick={() => toggleLogExpand(log.id)}>
                          <div className='flex items-start justify-between gap-4'>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-3 mb-3 flex-wrap'>
                                <span className='px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full'>
                                  {log.model}
                                </span>
                                <span
                                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    log.status === 'success'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                  {log.status}
                                </span>
                                <span className='text-xs text-slate-500'>
                                  {formatDate(log.createdAt)}
                                </span>
                              </div>
                              <p className='text-slate-700 font-medium mb-4 line-clamp-2'>
                                {log.input}
                              </p>
                              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                                <div className='flex items-center gap-2'>
                                  <Zap className='w-4 h-4 text-emerald-600 flex-shrink-0' />
                                  <div className='min-w-0'>
                                    <p className='text-xs text-slate-500'>
                                      Tokens
                                    </p>
                                    <p className='text-sm font-medium text-slate-900'>
                                      {log.totalTokens?.toLocaleString() || 0}
                                    </p>
                                  </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <DollarSign className='w-4 h-4 text-emerald-600 flex-shrink-0' />
                                  <div className='min-w-0'>
                                    <p className='text-xs text-slate-500'>
                                      Cost
                                    </p>
                                    <p className='text-sm font-medium text-slate-900'>
                                      {formatCost(log.totalCost)}
                                    </p>
                                  </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Clock className='w-4 h-4 text-emerald-600 flex-shrink-0' />
                                  <div className='min-w-0'>
                                    <p className='text-[10px] text-slate-500'>
                                      Time
                                    </p>
                                    <p className='text-xs font-medium text-slate-900'>
                                      {log.responseTimeMs}ms
                                    </p>
                                  </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Activity className='w-3.5 h-3.5 text-emerald-600 flex-shrink-0' />
                                  <div className='min-w-0'>
                                    <p className='text-[10px] text-slate-500'>
                                      Effort
                                    </p>
                                    <p className='text-xs font-medium text-slate-900'>
                                      {log.reasoningEffort || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button className='p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0'>
                              {expandedLogId === log.id ? (
                                <ChevronUp className='w-4 h-4 text-slate-600' />
                              ) : (
                                <ChevronDown className='w-4 h-4 text-slate-600' />
                              )}
                            </button>
                          </div>
                        </div>{' '}
                        {/* Expanded Content */}
                        {expandedLogId === log.id && (
                          <div className='mt-4 pt-4 border-t border-slate-200 space-y-4'>
                            {log.errorMessage && (
                              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                                <p className='text-xs font-medium text-red-700 mb-1'>
                                  Error
                                </p>
                                <p className='text-sm text-red-600'>
                                  {log.errorMessage}
                                </p>
                              </div>
                            )}
                            {log.rawOutput && (
                              <div className='bg-slate-50 border border-slate-200 rounded-lg p-4'>
                                <p className='text-xs font-medium text-slate-700 mb-2'>
                                  Raw Output
                                </p>
                                <pre className='text-xs text-slate-600 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto'>
                                  {JSON.stringify(
                                    JSON.parse(log.rawOutput),
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            )}
                            <div className='grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-slate-50 rounded-lg p-4'>
                              <div>
                                <span className='text-slate-500'>
                                  Input Tokens:
                                </span>
                                <span className='ml-2 font-medium text-slate-900'>
                                  {log.inputTokens?.toLocaleString() || 0}
                                </span>
                              </div>
                              <div>
                                <span className='text-slate-500'>
                                  Output Tokens:
                                </span>
                                <span className='ml-2 font-medium text-slate-900'>
                                  {log.outputTokens?.toLocaleString() || 0}
                                </span>
                              </div>
                              <div>
                                <span className='text-slate-500'>
                                  Input Cost:
                                </span>
                                <span className='ml-2 font-medium text-slate-900'>
                                  {formatCost(log.inputCost)}
                                </span>
                              </div>
                              <div>
                                <span className='text-slate-500'>
                                  Output Cost:
                                </span>
                                <span className='ml-2 font-medium text-slate-900'>
                                  {formatCost(log.outputCost)}
                                </span>
                              </div>
                              <div>
                                <span className='text-slate-500'>
                                  Endpoint:
                                </span>
                                <span className='ml-2 font-medium text-slate-900 truncate'>
                                  {log.endpoint || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className='text-slate-500'>
                                  Request Type:
                                </span>
                                <span className='ml-2 font-medium text-slate-900'>
                                  {log.requestType}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))
                  ) : (
                    <div className='text-center py-12'>
                      <Activity className='w-12 h-12 text-slate-300 mx-auto mb-3' />
                      <p className='text-slate-500'>No logs found</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='space-y-6'>
                  {modalData && modalData.length > 0 ? (
                    modalData.map((onboarding) => (
                      <Card key={onboarding.id}>
                        <div className='flex items-center justify-between mb-4'>
                          <h4 className='text-lg font-semibold text-slate-900'>
                            Onboarding #{onboarding.id.slice(0, 8)}
                          </h4>
                          <span className='text-sm text-slate-500'>
                            {formatDate(onboarding.completedAt)}
                          </span>
                        </div>

                        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Gender
                            </p>
                            <p className='font-medium text-slate-900 capitalize'>
                              {onboarding.gender || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>Age</p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.age || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Height
                            </p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.height
                                ? `${onboarding.height} cm`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>Goal</p>
                            <p className='font-medium text-slate-900 capitalize'>
                              {onboarding.goal?.replace('_', ' ') || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Current Weight
                            </p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.currentWeight
                                ? `${onboarding.currentWeight} kg`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Target Weight
                            </p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.targetWeight
                                ? `${onboarding.targetWeight} kg`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Activity Level
                            </p>
                            <p className='font-medium text-slate-900 capitalize'>
                              {onboarding.activityLevel || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>BMR</p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.bmr || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>TDEE</p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.tdee || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Daily Calorie Target
                            </p>
                            <p className='font-medium text-emerald-700'>
                              {onboarding.dailyCalorieTarget || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Protein Target
                            </p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.proteinTarget
                                ? `${onboarding.proteinTarget}g`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Carbs Target
                            </p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.carbsTarget
                                ? `${onboarding.carbsTarget}g`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Fats Target
                            </p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.fatsTarget
                                ? `${onboarding.fatsTarget}g`
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Diet Preference
                            </p>
                            <p className='font-medium text-slate-900 capitalize'>
                              {onboarding.dietPreference || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className='text-xs text-slate-500 mb-1'>
                              Target Date
                            </p>
                            <p className='font-medium text-slate-900'>
                              {onboarding.targetDate
                                ? formatDate(onboarding.targetDate)
                                : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {onboarding.healthConditions &&
                          onboarding.healthConditions.length > 0 && (
                            <div className='mt-4 pt-4 border-t border-slate-200'>
                              <p className='text-xs text-slate-500 mb-2'>
                                Health Conditions
                              </p>
                              <div className='flex flex-wrap gap-2'>
                                {onboarding.healthConditions.map(
                                  (condition, idx) => (
                                    <span
                                      key={idx}
                                      className='px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full'>
                                      {condition.replace('_', ' ')}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </Card>
                    ))
                  ) : (
                    <div className='text-center py-12'>
                      <FileText className='w-12 h-12 text-slate-300 mx-auto mb-3' />
                      <p className='text-slate-500'>No onboarding data found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Admin;
