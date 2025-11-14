import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DemoWalletContext = createContext();

export const useDemoWallet = () => useContext(DemoWalletContext);

export default function DemoWalletProvider({ children }) {
  const storageKey = 'demo_balance_ton';
  const enabledKey = 'demo_mode_enabled';
  const [demoBalance, setDemoBalance] = useState(() => {
    const val = parseFloat(localStorage.getItem(storageKey));
    return Number.isFinite(val) ? Math.max(0, val) : 10.5;
  });
  const [enabled, setEnabled] = useState(() => {
    const raw = localStorage.getItem(enabledKey);
    return raw === null ? true : raw === 'true';
  });

  useEffect(() => {
    localStorage.setItem(storageKey, String(demoBalance));
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem(enabledKey, String(enabled));
  }, [enabled]);

  const spend = (amountTon) => {
    const amt = parseFloat(amountTon);
    if (!Number.isFinite(amt) || amt <= 0) return false;
    if (amt > demoBalance) return false;
    setDemoBalance(prev => Math.max(0, +(prev - amt).toFixed(6)));
    return true;
  };

  const credit = (amountTon) => {
    const amt = parseFloat(amountTon);
    if (!Number.isFinite(amt) || amt <= 0) return false;
    setDemoBalance(prev => +(prev + amt).toFixed(6));
    return true;
  };

  const reset = (val = 10.5) => {
    const amt = parseFloat(val);
    setDemoBalance(Number.isFinite(amt) && amt >= 0 ? amt : 10.5);
  };

  const value = useMemo(() => ({
    enabled,
    setEnabled,
    demoBalance,
    setDemoBalance,
    spend,
    credit,
    reset,
  }), [enabled, demoBalance]);

  return (
    <DemoWalletContext.Provider value={value}>
      {children}
    </DemoWalletContext.Provider>
  );
}
