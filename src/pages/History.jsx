import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTonAddress } from '@tonconnect/ui-react';
import { useDemoWallet } from '../context/DemoWalletContext';
import { ListSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function History() {
  const address = useTonAddress();
  const { enabled } = useDemoWallet();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    search: ''
  });

  const getMockAddress = () => {
    const key = 'demo_wallet_address';
    let a = localStorage.getItem(key);
    if (!a) {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      a = 'EQ';
      for (let i = 0; i < 46; i++) {
        a += chars[Math.floor(Math.random() * chars.length)];
      }
      localStorage.setItem(key, a);
    }
    return a;
  };

  useEffect(() => {
    fetchTransactions();
  }, [address, enabled, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Use address or demo wallet address
      const walletAddr = address || (enabled ? getMockAddress() : null);
      if (walletAddr) params.append('walletAddress', walletAddr);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await axios.get(`/api/transaction?${params}`);
      
      // Check if response is successful (success can be true, undefined, or not false)
      if (res.data && res.data.success !== false) {
        let txns = res.data.transactions || res.data || [];

        // Apply date range filter
        if (filters.dateRange !== 'all') {
          const now = new Date();
          let startDate;
          if (filters.dateRange === 'today') {
            startDate = new Date(now.setHours(0, 0, 0, 0));
          } else if (filters.dateRange === 'week') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          } else if (filters.dateRange === 'month') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          }
          if (startDate) {
            txns = txns.filter(tx => {
              if (!tx.createdAt) return false;
              return new Date(tx.createdAt) >= startDate;
            });
          }
        }

        // Sort by date (newest first)
        txns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(txns);
      } else {
        // Response indicates failure
        const errorMsg = res.data?.error || 'Failed to load transactions';
        console.error('Transaction API error:', errorMsg);
        toast.error(errorMsg);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load transactions';
      toast.error(errorMsg);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      airtime: '📱',
      data: '📶',
      payout: '🏦',
      gift: '🎁',
      split: '🧾',
    };
    return icons[type] || '💳';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-4 safe-area-padding app-gradient min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <button
          onClick={fetchTransactions}
          className="tp-btn tp-button-muted text-sm px-3 py-1"
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="tp-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="tp-input w-full text-sm"
            >
              <option value="all">All Types</option>
              <option value="airtime">Airtime</option>
              <option value="data">Data</option>
              <option value="payout">Bank Transfer</option>
              <option value="gift">Gift</option>
              <option value="split">Split Bill</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="tp-input w-full text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="tp-input w-full text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Search</label>
            <input
              type="search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search..."
              className="tp-input w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="tp-card p-3 text-center">
            <div className="text-xs opacity-70">Total</div>
            <div className="font-bold">{transactions.length}</div>
          </div>
          <div className="tp-card p-3 text-center">
            <div className="text-xs opacity-70">Completed</div>
            <div className="font-bold text-green-600">
              {transactions.filter(t => t.status === 'completed').length}
            </div>
          </div>
          <div className="tp-card p-3 text-center">
            <div className="text-xs opacity-70">Pending</div>
            <div className="font-bold text-yellow-600">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {loading ? (
        <ListSkeleton count={5} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No Transactions"
          message={filters.type !== 'all' || filters.status !== 'all' || filters.search
            ? "No transactions match your filters. Try adjusting your search."
            : "You haven't made any transactions yet. Start by buying airtime or sending a gift!"}
          action={() => setFilters({ type: 'all', status: 'all', dateRange: 'all', search: '' })}
          actionLabel={filters.type !== 'all' || filters.status !== 'all' || filters.search ? "Clear Filters" : undefined}
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx._id} className="tp-card p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getTypeIcon(tx.type)}</div>
                  <div>
                    <div className="font-semibold capitalize">{tx.type}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {tx.amountTON && (
                    <div className="font-bold">{tx.amountTON.toFixed(4)} TON</div>
                  )}
                  {tx.amountNGN && (
                    <div className="text-sm text-gray-600">
                      ₦{tx.amountNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>
              
              {tx.fee && (
                <div className="text-xs text-gray-500 mb-2">
                  Fee: ₦{tx.fee.toLocaleString('en-NG')}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
                {tx.walletAddress && (
                  <span className="text-xs text-gray-500 font-mono">
                    {tx.walletAddress.slice(0, 6)}...{tx.walletAddress.slice(-4)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
