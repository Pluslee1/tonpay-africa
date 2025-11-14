import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDemoWallet } from '../context/DemoWalletContext';

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { enabled, setEnabled, demoBalance, credit, reset } = useDemoWallet();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [preferences, setPreferences] = useState({
    defaultConversion: 'NGN',
    autoConvertGifts: false,
    notifications: { email: true, sms: true, push: true }
  });
  const [kyc, setKyc] = useState({ bvn: '', nin: '' });
  const [bankAccount, setBankAccount] = useState({
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: ''
  });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/user/profile');
      if (res.data.success) {
        const u = res.data.user;
        setProfile({
          firstName: u.profile?.firstName || '',
          lastName: u.profile?.lastName || '',
          phone: u.phone || '',
          email: u.email || ''
        });
        setPreferences(u.preferences || preferences);
        setBankAccounts(u.bankAccounts || []);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/user/stats');
      if (res.data.success) setStats(res.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        email: profile.email
      };
      const res = await axios.put('/api/user/profile', payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.data.success) {
        alert('✅ Profile updated successfully!');
        fetchProfile(); // Refresh profile data
      } else {
        alert('Update failed: ' + (res.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response?.status === 401) {
        alert('Please login again to update your profile');
      } else {
        alert('Update failed: ' + (error.response?.data?.error || error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      await axios.put('/api/user/preferences', preferences);
      alert('Preferences updated successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const submitKYC = async () => {
    setLoading(true);
    try {
      await axios.post('/api/verify', kyc);
      alert('KYC submitted for verification');
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.error || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  const addBankAccount = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/user/bank-account', bankAccount);
      if (res.data.success) {
        setBankAccounts(res.data.bankAccounts);
        setBankAccount({ bankName: '', bankCode: '', accountNumber: '', accountName: '' });
        alert('Bank account added');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'kyc', label: 'KYC', icon: '🔐' },
    { id: 'banks', label: 'Bank Accounts', icon: '🏦' },
    { id: 'demo', label: 'Demo Mode', icon: '🧪' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 py-4 safe-area-padding app-gradient min-h-screen">
      <h2 className="text-2xl font-bold">Settings</h2>

      {stats && (
        <div className="tp-card p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs opacity-70">KYC Status</p>
              <p className="font-bold">{stats.kycStatus}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Daily Limit</p>
              <p className="font-bold">₦{stats.dailyLimit?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Used Today</p>
              <p className="font-bold">₦{stats.dailyUsed?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Transactions</p>
              <p className="font-bold">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'demo' && (
        <div className="tp-card p-4 space-y-4">
          <h3 className="font-bold">Demo Mode</h3>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <span className="text-sm">Enable Demo Mode (use simulated TON balance across the app)</span>
          </label>
          <div className="p-3 tp-card tone-airtime">
            <p className="text-sm">Current Demo Balance</p>
            <p className="text-2xl font-bold">{demoBalance.toFixed(4)} TON</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => credit(0.5)} className="tp-btn tp-button-primary text-sm">+0.5</button>
            <button onClick={() => credit(1)} className="tp-btn tp-button-primary text-sm">+1</button>
            <button onClick={() => credit(5)} className="tp-btn tp-button-primary text-sm">+5</button>
            <button onClick={() => reset(10.5)} className="tp-btn tp-button-muted text-sm">Reset</button>
          </div>
          <p className="text-xs opacity-70">Tip: Convert a Gift to TON to also credit your demo balance.</p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tp-btn px-4 py-2 whitespace-nowrap text-sm ${
              activeTab === tab.id ? 'tp-button-primary' : 'tp-button-muted'
            }`}
          >
            <span className="mr-1">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="tp-card p-4 space-y-4">
          <h3 className="font-bold">Profile Information</h3>
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="tp-input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="tp-input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input 
              type="tel" 
              value={profile.phone || ''} 
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
              className="tp-input w-full" 
              placeholder="e.g. 08012345678"
            />
            <p className="text-xs opacity-60 mt-1">Enter your phone number</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input 
              type="email" 
              value={profile.email || ''} 
              onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
              className="tp-input w-full" 
              placeholder="e.g. yourname@example.com"
            />
            <p className="text-xs opacity-60 mt-1">Enter your email address</p>
          </div>
          <button onClick={saveProfile} disabled={loading} className="w-full tp-btn tp-button-primary disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="tp-card p-4 space-y-4">
          <h3 className="font-bold">Preferences</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Default Conversion</label>
            <select value={preferences.defaultConversion} onChange={(e) => setPreferences({ ...preferences, defaultConversion: e.target.value })} className="tp-input w-full">
              <option value="TON">TON</option>
              <option value="NGN">Naira (NGN)</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={preferences.autoConvertGifts} onChange={(e) => setPreferences({ ...preferences, autoConvertGifts: e.target.checked })} />
            <span className="text-sm">Auto-convert gifts to Naira</span>
          </label>
          <div>
            <p className="text-sm font-medium mb-2">Notifications</p>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={preferences.notifications.email} onChange={(e) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, email: e.target.checked } })} />
              <span className="text-sm">Email</span>
            </label>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={preferences.notifications.sms} onChange={(e) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, sms: e.target.checked } })} />
              <span className="text-sm">SMS</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={preferences.notifications.push} onChange={(e) => setPreferences({ ...preferences, notifications: { ...preferences.notifications, push: e.target.checked } })} />
              <span className="text-sm">Push Notifications</span>
            </label>
          </div>
          <button onClick={savePreferences} disabled={loading} className="w-full tp-btn tp-button-primary disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="tp-card p-4 space-y-4">
          <h3 className="font-bold">KYC Verification</h3>
          
          {/* KYC Status Display */}
          {user?.kyc && (
            <div className={`p-4 rounded-lg ${
              user.kyc.status === 'verified' ? 'bg-green-50 border border-green-200' :
              user.kyc.status === 'rejected' ? 'bg-red-50 border border-red-200' :
              user.kyc.status === 'initiated' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  user.kyc.status === 'verified' ? 'bg-green-100 text-green-800' :
                  user.kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  user.kyc.status === 'initiated' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.kyc.status === 'verified' ? '✅ Verified' :
                   user.kyc.status === 'rejected' ? '❌ Rejected' :
                   user.kyc.status === 'initiated' ? '⏳ In Progress' :
                   '⏸️ Pending'}
                </span>
              </div>
              {user.kyc.status === 'verified' && user.kyc.verifiedAt && (
                <p className="text-xs text-gray-600">
                  Verified on: {new Date(user.kyc.verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div className="p-3 tp-card tone-airtime">
            <p className="text-sm font-semibold mb-2">📌 Why Verify?</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Increase transfer limit to ₦50,000+</li>
              <li>Access all premium features</li>
              <li>Enhanced security for your account</li>
            </ul>
          </div>

          {user?.kyc?.status !== 'verified' && (
            <button
              onClick={() => navigate('/kyc')}
              className="w-full tp-btn tp-button-primary"
            >
              {user?.kyc?.status === 'initiated' ? 'Continue KYC Verification' : 'Start KYC Verification'}
            </button>
          )}

          {user?.kyc?.status === 'verified' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Your identity has been verified. You can now transfer amounts above ₦50,000.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'banks' && (
        <div className="space-y-4">
          <div className="tp-card p-4 space-y-3">
            <h3 className="font-bold">Add Bank Account</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <input value={bankAccount.bankName} onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })} className="tp-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Number</label>
              <input value={bankAccount.accountNumber} onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })} className="tp-input w-full" />
            </div>
            <button onClick={addBankAccount} disabled={loading} className="w-full tp-btn tp-button-primary disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Bank Account'}
            </button>
          </div>
          {bankAccounts.length > 0 && (
            <div className="tp-card p-4">
              <h3 className="font-bold mb-3">Saved Accounts</h3>
              <div className="space-y-2">
                {bankAccounts.map((acc, i) => (
                  <div key={i} className="p-3 tp-card tone-send">
                    <p className="font-semibold">{acc.bankName}</p>
                    <p className="text-sm opacity-70">{acc.accountNumber} • {acc.accountName}</p>
                    {acc.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}





