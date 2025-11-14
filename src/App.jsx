import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SendToBank from './pages/SendToBank';
import SplitBill from './pages/SplitBill';
import Gifts from './pages/Gifts';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import TonConnectProvider from './components/TonConnectProvider';
import DemoWalletProvider from './context/DemoWalletContext';
import Airtime from './pages/Airtime';
import Data from './pages/Data';
import History from './pages/History';
import ClaimGift from './pages/ClaimGift';
import KYC from './pages/KYC';
import Toaster from './components/Toaster';
import NetworkStatus from './components/NetworkStatus';
import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    console.error('Error caught:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Something went wrong. Please check the console.</div>;
    }
    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    console.log('App mounted');
  }, []);

  return (
    <ErrorBoundary>
      <TonConnectProvider>
        <DemoWalletProvider>
          <AuthProvider>
            <NetworkStatus />
            <Toaster />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="send-to-bank" element={<SendToBank />} />
                  <Route path="split-bill" element={<SplitBill />} />
                  <Route path="airtime" element={<Airtime />} />
                  <Route path="data" element={<Data />} />
                  <Route path="history" element={<History />} />
                  <Route path="gifts" element={<Gifts />} />
                  <Route path="gifts/claim" element={<ClaimGift />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="kyc" element={<KYC />} />
                  <Route path="admin" element={<Admin />} />
                </Route>
            </Routes>
          </AuthProvider>
        </DemoWalletProvider>
      </TonConnectProvider>
    </ErrorBoundary>
  );
}

export default App;
