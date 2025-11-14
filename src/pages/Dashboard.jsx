import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import axios from 'axios';
import { useDemoWallet } from '../context/DemoWalletContext';
import { getBalance } from '../services/ton';
import { getHistory } from '../services/history';
import { BalanceSkeleton, ListSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const address = useTonAddress();
  const { demoBalance, enabled } = useDemoWallet();
  const [balance, setBalance] = useState({ ton: 0, ngn: 0 });
  const [rate, setRate] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);

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
    fetchRate();
  }, []);

  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
    } catch {}
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [address, rate, demoBalance, enabled]);

  useEffect(() => {
    const loadRecent = () => setRecent(getHistory().slice(0, 3));
    loadRecent();
    const onStorage = () => loadRecent();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fetchRate = async () => {
    try {
      const res = await axios.get('/api/rate');
      setRate(res.data.rate);
    } catch (error) {
      console.error('Rate fetch error:', error);
      toast.error('Failed to fetch exchange rate');
    }
  };

  const fetchBalance = async () => {
    setLoading(true);
    try {
      if (!address) {
        // No wallet connected - don't show balance
        setBalance({ ton: 0, ngn: 0 });
      } else if (enabled) {
        // Wallet connected + demo mode enabled - show demo balance
        setBalance({ ton: demoBalance, ngn: demoBalance * rate });
      } else {
        // Wallet connected + demo mode disabled - show real balance
        const result = await getBalance(address);
        const ton = result?.balance || 0;
        setBalance({ ton, ngn: ton * rate });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] app-gradient">
      <header className="flex justify-between items-center px-4 py-3 border-b border-[var(--tg-theme-hint-color)] header-glow">
        <h1 className="text-lg font-semibold">TONPay Africa</h1>
        {address ? (
          <div className="text-xs bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] px-3 py-1 rounded-full">
            Connected
          </div>
        ) : (
          <div className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
            Not Connected
          </div>
        )}
      </header>

      <section className="px-4 mt-4">
        {loading && address ? (
          <BalanceSkeleton />
        ) : address ? (
          <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl p-4 text-center tp-card">
            <p className="text-sm opacity-80">Your Balance{enabled ? ' (Demo)' : ''}</p>
            <h2 className="text-3xl font-bold mt-1">{balance.ton.toFixed(2)} TON</h2>
            <p className="text-base mt-1 opacity-90">≈ ₦{balance.ngn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs opacity-60 mt-1">1 TON = ₦{rate.toLocaleString()}</p>
          </div>
        ) : (
          <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-2xl p-6 text-center tp-card">
            <p className="text-sm opacity-70 mb-3">Connect your wallet to see your balance</p>
            <TonConnectButton />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            className="tp-btn tone-send rounded-2xl py-4 flex flex-col items-center justify-center transition-all duration-200 font-semibold"
            onClick={() => navigate('/send-to-bank')}
          >
            <div className="text-3xl mb-2 drop-shadow-lg">🏦</div>
            <span className="text-sm font-bold">Send to Bank</span>
          </button>

          <button
            className="tp-btn tone-split rounded-2xl py-4 flex flex-col items-center justify-center transition-all duration-200 font-semibold"
            onClick={() => navigate('/split-bill')}
          >
            <div className="text-3xl mb-2 drop-shadow-lg">🧾</div>
            <span className="text-sm font-bold">Split Bill</span>
          </button>

          <button
            className="tp-btn tone-airtime rounded-2xl py-4 flex flex-col items-center justify-center transition-all duration-200 font-semibold"
            onClick={() => navigate('/airtime')}
          >
            <div className="text-3xl mb-2 drop-shadow-lg">📱</div>
            <span className="text-sm font-bold">Airtime</span>
          </button>

          <button
            className="tp-btn tone-gift rounded-2xl py-4 flex flex-col items-center justify-center transition-all duration-200 font-semibold"
            onClick={() => navigate('/gifts')}
          >
            <div className="text-3xl mb-2 drop-shadow-lg">🎁</div>
            <span className="text-sm font-bold">Gifts</span>
          </button>
        </div>
      </section>

      <section className="px-4 mt-6 mb-20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Recent Transactions</h3>
          <button onClick={() => navigate('/history')} className="text-sm text-[var(--tg-theme-button-color)] tp-btn px-2 py-1">View all</button>
        </div>
        <div className="space-y-2">
          {recent.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No Recent Transactions"
              message="Your recent transactions will appear here"
              action={() => navigate('/history')}
              actionLabel="View Full History"
            />
          ) : (
            recent.map((it) => (
              <button
                key={it.id}
                onClick={() => navigate('/history')}
                className="w-full flex justify-between items-center bg-[var(--tg-theme-secondary-bg-color)] p-3 rounded-xl text-left tp-card"
              >
                <div>
                  <div className="text-sm font-medium">{it.title || it.section}</div>
                  <div className="text-xs opacity-70">{new Date(it.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  {typeof it.amountTON === 'number' && (
                    <span className="text-sm font-semibold">{it.amountTON.toFixed(2)} TON</span>
                  )}
                  {typeof it.amountNGN === 'number' && (
                    <div className="text-xs opacity-80">₦{it.amountNGN.toLocaleString('en-NG')}</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

