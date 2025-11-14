import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Admin() {
  const { isAdmin, user, login, fetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [tonWallet, setTonWallet] = useState(null);
  const [paystackBalance, setPaystackBalance] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  // Filters
  const [txFilters, setTxFilters] = useState({ status: 'all', type: 'all', search: '', page: 1 });
  const [userFilters, setUserFilters] = useState({ status: 'all', kycStatus: 'all', role: 'all', search: '', page: 1 });
  
  // Forms
  const [depositForm, setDepositForm] = useState({ amount: '', note: '' });
  const [walletForm, setWalletForm] = useState({ address: '', publicKey: '', privateKey: '' });
  const [autoSettings, setAutoSettings] = useState({ minBalanceNGN: 100000, maxDailyWithdrawalNGN: 10000000, autoProcessWithdrawals: true });
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
      const interval = setInterval(() => {
        fetchHealth();
        fetchStats();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (isAdmin && activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [isAdmin, activeTab, txFilters]);

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      fetchUsers();
    }
  }, [isAdmin, activeTab, userFilters]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchHealth(),
      fetchStats(),
      fetchBalance(),
      fetchPendingWithdrawals(),
      fetchTonWallet(),
      fetchPaystackBalance(),
      fetchAutoSettings(),
      fetchAnalytics()
    ]);
  };

  const fetchHealth = async () => {
    try {
      const res = await axios.get('/api/admin/health');
      setHealth(res.data);
    } catch (error) {
      console.error('Health check error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await axios.get('/api/admin/balance');
      setBalance(res.data);
    } catch (error) {
      console.error('Fetch balance error:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (txFilters.status !== 'all') params.append('status', txFilters.status);
      if (txFilters.type !== 'all') params.append('type', txFilters.type);
      if (txFilters.search) params.append('search', txFilters.search);
      params.append('page', txFilters.page);
      params.append('limit', 50);
      
      const res = await axios.get(`/api/admin/transactions?${params}`);
      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userFilters.status !== 'all') params.append('status', userFilters.status);
      if (userFilters.kycStatus !== 'all') params.append('kycStatus', userFilters.kycStatus);
      if (userFilters.role !== 'all') params.append('role', userFilters.role);
      if (userFilters.search) params.append('search', userFilters.search);
      params.append('page', userFilters.page);
      params.append('limit', 50);
      
      const res = await axios.get(`/api/admin/users?${params}`);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const res = await axios.get(`/api/admin/users/${userId}`);
      setSelectedUser(res.data);
    } catch (error) {
      toast.error('Failed to fetch user details');
    }
  };

  const fetchPendingWithdrawals = async () => {
    try {
      const res = await axios.get('/api/admin/withdrawals/pending');
      setPendingWithdrawals(res.data.withdrawals || []);
    } catch (error) {
      console.error('Fetch pending withdrawals error:', error);
    }
  };

  const fetchTonWallet = async () => {
    try {
      const res = await axios.get('/api/admin/wallet/ton');
      setTonWallet(res.data.wallet);
    } catch (error) {
      console.error('Fetch TON wallet error:', error);
    }
  };

  const fetchPaystackBalance = async () => {
    try {
      const res = await axios.get('/api/admin/wallet/paystack');
      setPaystackBalance(res.data);
    } catch (error) {
      console.error('Fetch Paystack balance error:', error);
    }
  };

  const fetchAutoSettings = async () => {
    try {
      const res = await axios.get('/api/admin/balance');
      if (res.data.success && res.data.balance) {
        setAutoSettings({
          minBalanceNGN: res.data.balance.minBalanceNGN || 100000,
          maxDailyWithdrawalNGN: res.data.balance.maxDailyWithdrawalNGN || 10000000,
          autoProcessWithdrawals: res.data.balance.autoProcessWithdrawals !== false
        });
      }
    } catch (error) {
      console.error('Fetch auto settings error:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('/api/admin/analytics?period=30');
      setAnalytics(res.data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Login successful!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      toast.error(`Login failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/balance/deposit', depositForm);
      toast.success(res.data.message);
      setDepositForm({ amount: '', note: '' });
      await fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleSetWallet = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/api/admin/wallet/ton', walletForm);
      toast.success(res.data.message);
      setWalletForm({ address: '', publicKey: '', privateKey: '' });
      await fetchTonWallet();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to set wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTon = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/wallet/ton/sync');
      toast.success(res.data.message);
      await fetchTonWallet();
      await fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to sync');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoProcessing = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/auto-processing/toggle');
      toast.success(res.data.message);
      setAutoSettings({ ...autoSettings, autoProcessWithdrawals: res.data.autoProcessWithdrawals });
      await fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to toggle');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAutoSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/api/admin/auto-processing/settings', autoSettings);
      toast.success('Settings updated');
      await fetchAutoSettings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerProcessing = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/auto-processing/trigger');
      toast.success(res.data.message);
      await fetchPendingWithdrawals();
      await fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to trigger processing');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (id) => {
    if (!confirm('Process this withdrawal now?')) return;
    setLoading(true);
    try {
      const res = await axios.post(`/api/admin/withdrawals/${id}/process`);
      toast.success(res.data.message || 'Withdrawal processed');
      await fetchPendingWithdrawals();
      await fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWithdrawal = async (id) => {
    const note = prompt('Add a note (optional):');
    setLoading(true);
    try {
      const res = await axios.post(`/api/admin/withdrawals/${id}/complete`, { note });
      toast.success(res.data.message || 'Withdrawal completed');
      await fetchPendingWithdrawals();
      await fetchBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectWithdrawal = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setLoading(true);
    try {
      const res = await axios.post(`/api/admin/withdrawals/${id}/reject`, { reason });
      toast.success(res.data.message || 'Withdrawal rejected');
      await fetchPendingWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, status) => {
    const reason = prompt(`Reason for ${status} (optional):`);
    setLoading(true);
    try {
      const res = await axios.put(`/api/admin/users/${userId}/status`, { status, reason });
      toast.success(res.data.message);
      await fetchUsers();
      if (selectedUser && selectedUser.user?._id === userId) {
        await fetchUserDetails(userId);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserKYC = async (userId, status) => {
    const note = prompt(`Note for KYC ${status} (optional):`);
    setLoading(true);
    try {
      const res = await axios.put(`/api/admin/users/${userId}/kyc`, { status, note });
      toast.success(res.data.message);
      await fetchUsers();
      if (selectedUser && selectedUser.user?._id === userId) {
        await fetchUserDetails(userId);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update KYC');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center app-gradient px-4 py-8">
        <div className="w-full max-w-md tp-card p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="admin@tonpay.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="tp-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="tp-input w-full"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full tp-btn tp-button-primary disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'balance', label: 'Balance', icon: '💰' },
    { id: 'withdrawals', label: 'Withdrawals', icon: '🏦' },
    { id: 'wallet', label: 'Wallet', icon: '🔐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-4 min-h-screen app-gradient">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="tp-btn tp-button-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold whitespace-nowrap text-sm ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-1">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Health Status */}
          {health && (
            <div className={`tp-card p-4 ${
              health.status === 'healthy' ? 'bg-green-50 border-green-200' :
              health.status === 'degraded' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">System Health</h3>
                  <p className="text-sm">
                    Status: <span className={`font-semibold ${
                      health.status === 'healthy' ? 'text-green-600' :
                      health.status === 'degraded' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {health.status === 'healthy' ? '✅ Healthy' :
                       health.status === 'degraded' ? '⚠️ Degraded' :
                       '❌ Unhealthy'}
                    </span>
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>Uptime: {health.server?.uptimeFormatted || 'N/A'}</p>
                  <p>DB: {health.database?.status || 'unknown'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="tp-card p-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.users?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.users?.newToday || 0} new today • {stats.users?.verified || 0} verified
                </p>
              </div>
              <div className="tp-card p-4">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.transactions?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.transactions?.today || 0} today • {stats.transactions?.successRate || 0}% success
                </p>
              </div>
              <div className="tp-card p-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{stats.revenue?.totalNGN || '₦0'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Fees: {stats.revenue?.totalFees || '₦0'}
                </p>
              </div>
              <div className="tp-card p-4">
                <p className="text-sm text-gray-600">System Balance</p>
                <p className="text-2xl font-bold">{balance?.balance?.naira ? `₦${balance.balance.naira.toLocaleString('en-NG')}` : '₦0'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {balance?.balance?.ton || 0} TON
                </p>
              </div>
            </div>
          )}

          {/* Balance Summary */}
          {balance && (
            <div className="tp-card p-4">
              <h3 className="font-bold mb-4">System Balance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Available NGN</p>
                  <p className="text-xl font-bold">₦{balance.balance?.naira?.toLocaleString('en-NG') || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">TON Balance</p>
                  <p className="text-xl font-bold">{balance.balance?.ton || '0'} TON</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Withdrawals</p>
                  <p className="text-xl font-bold">{balance.pending?.count || 0}</p>
                  <p className="text-xs text-gray-500">₦{balance.pending?.totalNGN?.toLocaleString('en-NG') || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available for Processing</p>
                  <p className="text-xl font-bold text-green-600">₦{balance.pending?.availableNGN?.toLocaleString('en-NG') || '0'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Auto-Processing Status */}
          {balance && (
            <div className="tp-card p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">Auto-Processing</h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className={autoSettings.autoProcessWithdrawals ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {autoSettings.autoProcessWithdrawals ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Runs every 5 minutes automatically
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTriggerProcessing}
                    disabled={loading}
                    className="tp-btn tp-button-primary text-sm px-3 py-2 disabled:opacity-50"
                  >
                    Process Now
                  </button>
                  <button
                    onClick={handleToggleAutoProcessing}
                    disabled={loading}
                    className={`tp-btn text-sm px-3 py-2 disabled:opacity-50 ${
                      autoSettings.autoProcessWithdrawals
                        ? 'bg-red-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    {autoSettings.autoProcessWithdrawals ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="tp-card p-4">
            <h3 className="font-bold mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx._id} className="border-b">
                      <td className="py-2">{tx.type}</td>
                      <td className="py-2">{tx.amountTON} TON / ₦{tx.amountNGN?.toLocaleString('en-NG')}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions yet</p>
            )}
          </div>
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && health && (
        <div className="space-y-6">
          <div className="tp-card p-4">
            <h3 className="font-bold mb-4">System Health Status</h3>
            <div className={`p-4 rounded-lg mb-4 ${
              health.status === 'healthy' ? 'bg-green-50 border border-green-200' :
              health.status === 'degraded' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {health.status === 'healthy' ? '✅ System Healthy' :
                   health.status === 'degraded' ? '⚠️ System Degraded' :
                   '❌ System Unhealthy'}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(health.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="tp-card p-4">
                <h4 className="font-semibold mb-2">Server</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Uptime:</span> {health.server?.uptimeFormatted || 'N/A'}</p>
                  <p><span className="font-medium">Memory Used:</span> {health.server?.memory?.used || 'N/A'}</p>
                  <p><span className="font-medium">Memory Total:</span> {health.server?.memory?.total || 'N/A'}</p>
                  <p><span className="font-medium">RSS:</span> {health.server?.memory?.rss || 'N/A'}</p>
                  <p><span className="font-medium">CPU Cores:</span> {health.server?.cpu?.cpus || 'N/A'}</p>
                  <p><span className="font-medium">Platform:</span> {health.server?.platform || 'N/A'}</p>
                  <p><span className="font-medium">Node Version:</span> {health.server?.nodeVersion || 'N/A'}</p>
                </div>
              </div>

              <div className="tp-card p-4">
                <h4 className="font-semibold mb-2">Database</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={health.database?.status === 'connected' ? 'text-green-600' : 'text-red-600'}>
                      {health.database?.status === 'connected' ? '✅ Connected' : '❌ Disconnected'}
                    </span>
                  </p>
                  <p><span className="font-medium">Host:</span> {health.database?.host || 'N/A'}</p>
                  <p><span className="font-medium">Database:</span> {health.database?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="tp-card p-4">
                <h4 className="font-semibold mb-2">Services</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Paystack:</span>{' '}
                    <span className={health.services?.paystack?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
                      {health.services?.paystack?.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}
                    </span>
                    {health.services?.paystack?.balance !== undefined && (
                      <span className="ml-2">(₦{health.services.paystack.balance.toLocaleString('en-NG')})</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">TON:</span>{' '}
                    <span className={health.services?.ton?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
                      {health.services?.ton?.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="tp-card p-4">
            <h3 className="font-bold mb-4">User Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1">Status</label>
                <select
                  value={userFilters.status}
                  onChange={(e) => setUserFilters({ ...userFilters, status: e.target.value, page: 1 })}
                  className="tp-input w-full text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">KYC Status</label>
                <select
                  value={userFilters.kycStatus}
                  onChange={(e) => setUserFilters({ ...userFilters, kycStatus: e.target.value, page: 1 })}
                  className="tp-input w-full text-sm"
                >
                  <option value="all">All KYC</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Role</label>
                <select
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value, page: 1 })}
                  className="tp-input w-full text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Search</label>
                <input
                  type="text"
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value, page: 1 })}
                  className="tp-input w-full text-sm"
                  placeholder="Email, phone, name..."
                />
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="tp-card p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">KYC</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Joined</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        <div>
                          <p className="font-medium">{u.profile?.firstName} {u.profile?.lastName}</p>
                          <p className="text-xs text-gray-500">{u.email || u.phone}</p>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.status === 'active' ? 'bg-green-100 text-green-700' :
                          u.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.kyc?.status === 'verified' ? 'bg-green-100 text-green-700' :
                          u.kyc?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {u.kyc?.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-2">{u.role}</td>
                      <td className="py-2 text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => fetchUserDetails(u._id)}
                            className="tp-btn tp-button-secondary text-xs px-2 py-1"
                          >
                            View
                          </button>
                          {u.status !== 'suspended' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u._id, 'suspended')}
                              className="tp-btn bg-yellow-600 text-white text-xs px-2 py-1"
                            >
                              Suspend
                            </button>
                          )}
                          {u.status !== 'banned' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u._id, 'banned')}
                              className="tp-btn bg-red-600 text-white text-xs px-2 py-1"
                            >
                              Ban
                            </button>
                          )}
                          {u.status !== 'active' && (
                            <button
                              onClick={() => handleUpdateUserStatus(u._id, 'active')}
                              className="tp-btn bg-green-600 text-white text-xs px-2 py-1"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <p className="text-center text-gray-500 py-4">No users found</p>
            )}
          </div>

          {/* User Details Modal */}
          {selectedUser && (
            <div className="tp-card p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="tp-btn tp-button-muted text-sm px-3 py-1"
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">
                      {selectedUser.user?.profile?.firstName} {selectedUser.user?.profile?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedUser.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedUser.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">KYC Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedUser.user?.kyc?.status === 'verified' ? 'bg-green-100 text-green-700' :
                        selectedUser.user?.kyc?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedUser.user?.kyc?.status || 'pending'}
                      </span>
                      <select
                        onChange={(e) => handleUpdateUserKYC(selectedUser.user._id, e.target.value)}
                        className="tp-input text-xs"
                        defaultValue={selectedUser.user?.kyc?.status || 'pending'}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Stats</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Transactions</p>
                      <p className="font-bold">{selectedUser.stats?.totalTransactions || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Spent</p>
                      <p className="font-bold">₦{selectedUser.stats?.totalSpent?.toLocaleString('en-NG') || '0'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Transaction</p>
                      <p className="font-bold text-xs">
                        {selectedUser.stats?.lastTransaction ? new Date(selectedUser.stats.lastTransaction).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Recent Transactions</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedUser.transactions?.slice(0, 10).map((tx) => (
                      <div key={tx._id} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="flex justify-between">
                          <span>{tx.type}</span>
                          <span>₦{tx.amountNGN?.toLocaleString('en-NG')}</span>
                        </div>
                        <div className="text-gray-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="tp-card p-4">
            <h3 className="font-bold mb-4">Transaction Management</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1">Status</label>
                <select
                  value={txFilters.status}
                  onChange={(e) => setTxFilters({ ...txFilters, status: e.target.value, page: 1 })}
                  className="tp-input w-full text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  value={txFilters.type}
                  onChange={(e) => setTxFilters({ ...txFilters, type: e.target.value, page: 1 })}
                  className="tp-input w-full text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="airtime">Airtime</option>
                  <option value="data">Data</option>
                  <option value="payout">Payout</option>
                  <option value="gift">Gift</option>
                  <option value="split">Split Bill</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Search</label>
                <input
                  type="text"
                  value={txFilters.search}
                  onChange={(e) => setTxFilters({ ...txFilters, search: e.target.value, page: 1 })}
                  className="tp-input w-full text-sm"
                  placeholder="Wallet, email, phone..."
                />
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="tp-card p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">ID</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">User</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-mono text-xs">{tx._id.toString().slice(-8)}</td>
                      <td className="py-2">{tx.type}</td>
                      <td className="py-2">
                        {tx.userId ? (
                          <div>
                            <p className="text-xs">{tx.userId.email || tx.userId.phone}</p>
                            <p className="text-xs text-gray-500">{tx.walletAddress?.slice(0, 10)}...</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">{tx.walletAddress?.slice(0, 10)}...</span>
                        )}
                      </td>
                      <td className="py-2">
                        <div>
                          <p className="font-semibold">{tx.amountTON?.toFixed(4)} TON</p>
                          <p className="text-xs text-gray-500">₦{tx.amountNGN?.toLocaleString('en-NG')}</p>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600 text-xs">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions found</p>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="tp-card p-4">
            <h3 className="font-bold mb-4">Analytics (Last 30 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Daily Transactions</p>
                <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                  {analytics.dailyTransactions?.map((day) => (
                    <div key={day._id} className="flex justify-between text-xs">
                      <span>{day._id}</span>
                      <span className="font-semibold">{day.count} txns</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">User Growth</p>
                <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                  {analytics.userGrowth?.map((day) => (
                    <div key={day._id} className="flex justify-between text-xs">
                      <span>{day._id}</span>
                      <span className="font-semibold">{day.count} users</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Types</p>
                <div className="mt-2 space-y-1">
                  {analytics.typeDistribution?.map((type) => (
                    <div key={type._id} className="flex justify-between text-xs">
                      <span className="capitalize">{type._id}</span>
                      <span className="font-semibold">{type.count} ({type.totalNGN?.toLocaleString('en-NG') || '₦0'})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          {balance && (
            <div className="tp-card p-4">
              <h3 className="font-bold mb-4">System Balance Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Balance</p>
                  <p className="text-3xl font-bold">₦{balance.balance?.naira?.toLocaleString('en-NG') || '0'}</p>
                  <p className="text-lg mt-1">{balance.balance?.ton || '0'} TON</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Totals</p>
                  <p className="text-sm">Deposited: ₦{balance.balance?.totalDepositedNGN?.toLocaleString('en-NG') || '0'}</p>
                  <p className="text-sm">Withdrawn: ₦{balance.balance?.totalWithdrawnNGN?.toLocaleString('en-NG') || '0'}</p>
                  <p className="text-sm">TON Collected: {balance.balance?.totalCollectedTON || '0'} TON</p>
                </div>
              </div>
            </div>
          )}

          <div className="tp-card p-4">
            <h3 className="font-bold mb-4">Add Naira to System</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (NGN)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                  className="tp-input w-full"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Note (Optional)</label>
                <input
                  type="text"
                  value={depositForm.note}
                  onChange={(e) => setDepositForm({ ...depositForm, note: e.target.value })}
                  className="tp-input w-full"
                  placeholder="Initial liquidity"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full tp-btn tp-button-primary disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Add Naira'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-6">
          <div className="tp-card p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Pending Withdrawals ({pendingWithdrawals.length})</h3>
              <button
                onClick={handleTriggerProcessing}
                disabled={loading}
                className="tp-btn tp-button-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                Process All
              </button>
            </div>
            {pendingWithdrawals.length === 0 ? (
              <p className="text-gray-600">No pending withdrawals</p>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawals.map((w) => (
                  <div key={w.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">₦{w.amountNGN?.toLocaleString('en-NG')}</p>
                        <p className="text-sm text-gray-600">{w.amountTON} TON</p>
                        {w.user && (
                          <p className="text-xs text-gray-500">{w.user.name} ({w.user.email})</p>
                        )}
                        {w.bankDetails && (
                          <p className="text-xs text-gray-500">
                            {w.bankDetails.bankName} • {w.bankDetails.accountNumber} • {w.bankDetails.accountName}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProcessWithdrawal(w.id)}
                          disabled={loading}
                          className="tp-btn tp-button-primary text-xs px-3 py-1 disabled:opacity-50"
                        >
                          Process
                        </button>
                        <button
                          onClick={() => handleCompleteWithdrawal(w.id)}
                          disabled={loading}
                          className="tp-btn bg-green-600 text-white text-xs px-3 py-1 disabled:opacity-50"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(w.id)}
                          disabled={loading}
                          className="tp-btn bg-red-600 text-white text-xs px-3 py-1 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {tonWallet && (
            <div className="tp-card p-4">
              <h3 className="font-bold mb-4">TON Wallet</h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-semibold">Address:</span> {tonWallet.address || 'Not set'}</p>
                <p className="text-sm"><span className="font-semibold">Balance:</span> {tonWallet.balance || '0'} TON</p>
                <p className="text-sm"><span className="font-semibold">In System:</span> {tonWallet.balanceInSystem || '0'} TON</p>
                <p className="text-sm"><span className="font-semibold">Total Collected:</span> {tonWallet.totalCollected || '0'} TON</p>
              </div>
              <button
                onClick={handleSyncTon}
                disabled={loading}
                className="tp-btn tp-button-primary disabled:opacity-50"
              >
                🔄 Sync Balance
              </button>
            </div>
          )}

          {paystackBalance && (
            <div className="tp-card p-4">
              <h3 className="font-bold mb-4">Paystack Balance</h3>
              <p className="text-2xl font-bold">₦{paystackBalance.paystack?.balance?.toLocaleString('en-NG') || '0'}</p>
            </div>
          )}

          <div className="tp-card p-4">
            <h3 className="font-bold mb-4">Set TON Wallet Address</h3>
            <form onSubmit={handleSetWallet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Wallet Address</label>
                <input
                  type="text"
                  required
                  value={walletForm.address}
                  onChange={(e) => setWalletForm({ ...walletForm, address: e.target.value })}
                  className="tp-input w-full"
                  placeholder="EQ..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Public Key (Optional)</label>
                <input
                  type="text"
                  value={walletForm.publicKey}
                  onChange={(e) => setWalletForm({ ...walletForm, publicKey: e.target.value })}
                  className="tp-input w-full"
                  placeholder="Public key"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full tp-btn tp-button-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Set Wallet'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="tp-card p-4">
            <h3 className="font-bold mb-4">Auto-Processing Settings</h3>
            <form onSubmit={handleUpdateAutoSettings} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={autoSettings.autoProcessWithdrawals}
                    onChange={(e) => setAutoSettings({ ...autoSettings, autoProcessWithdrawals: e.target.checked })}
                  />
                  <span>Enable Auto-Processing</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Balance (NGN)</label>
                <input
                  type="number"
                  required
                  value={autoSettings.minBalanceNGN}
                  onChange={(e) => setAutoSettings({ ...autoSettings, minBalanceNGN: parseFloat(e.target.value) })}
                  className="tp-input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-processing stops if balance goes below this</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Daily Withdrawal (NGN)</label>
                <input
                  type="number"
                  required
                  value={autoSettings.maxDailyWithdrawalNGN}
                  onChange={(e) => setAutoSettings({ ...autoSettings, maxDailyWithdrawalNGN: parseFloat(e.target.value) })}
                  className="tp-input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum amount to process per day</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full tp-btn tp-button-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
