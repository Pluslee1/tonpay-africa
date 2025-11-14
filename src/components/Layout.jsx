import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import React, { useState, useEffect } from 'react';
import { useDemoWallet } from '../context/DemoWalletContext';
import { getBalance } from '../services/ton';
import WebApp from '@twa-dev/sdk';

export default function Layout() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const address = useTonAddress();
  const { demoBalance, enabled } = useDemoWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [balance, setBalance] = useState(0);
  const [showWalletMenu, setShowWalletMenu] = useState(false);

  // Reflect demo balance or fetch real balance
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (enabled) {
        if (!cancelled) setBalance(demoBalance);
      } else if (address) {
        try {
          const res = await getBalance(address);
          if (!cancelled) setBalance(res?.balance ?? 0);
        } catch (e) {
          if (!cancelled) setBalance(0);
        }
      } else {
        if (!cancelled) setBalance(0);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [demoBalance, enabled, address]);

  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
      // Note: setHeaderColor and setBackgroundColor are not supported in Telegram WebApp 6.0+
      // They will show warnings but won't break the app
      try {
        if (typeof WebApp.setHeaderColor === 'function') {
          WebApp.setHeaderColor('#6ab7ff');
        }
      } catch (e) {
        // Ignore if not supported
      }
      try {
        if (typeof WebApp.setBackgroundColor === 'function') {
          WebApp.setBackgroundColor('#f0f4f8');
        }
      } catch (e) {
        // Ignore if not supported
      }
    } catch (error) {
      // Ignore errors if not in Telegram environment
      console.log('Telegram WebApp not available:', error);
    }
  }, []);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
    setShowWalletMenu(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
      setShowWalletMenu(false);
    }
  };

  // Close wallet menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showWalletMenu && !event.target.closest('.wallet-menu-container')) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWalletMenu]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/send-to-bank', label: 'Send to Bank', icon: '🏦' },
    { path: '/split-bill', label: 'Split Bill', icon: '🧾' },
    { path: '/airtime', label: 'Airtime', icon: '📱' },
    { path: '/gifts', label: 'Gifts', icon: '🎁' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: '👑' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <h1 className="text-xl font-bold">TONPay Africa</h1>
            </div>
            
            {/* Connected Wallet Display */}
            {address ? (
              <div className="relative wallet-menu-container">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-all"
                >
                  <div className="text-left">
                    <div className="text-xs opacity-80">Connected</div>
                    <div className="text-sm font-semibold">{formatAddress(address)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{balance.toFixed(2)} TON</div>
                  </div>
                </button>

                {/* Wallet Menu Dropdown */}
                {showWalletMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b">
                      <div className="text-xs text-gray-500 mb-1">Wallet Address</div>
                      <div className="text-sm font-mono break-all mb-2">{address}</div>
                      <div className="text-xs text-gray-500 mb-1">Balance</div>
                      <div className="text-lg font-bold text-primary">{balance.toFixed(4)} TON</div>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>📋</span>
                      <span>Copy Address</span>
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                    >
                      <span>🔌</span>
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => tonConnectUI.openModal()}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 safe-area-bottom">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-area-bottom z-50">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-2 sm:px-4 min-w-[60px] touch-manipulation ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-gray-600'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="text-xl sm:text-2xl">{item.icon}</span>
                <span className="text-[10px] sm:text-xs mt-0.5 text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
