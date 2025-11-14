import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import axios from 'axios';
import { useDemoWallet } from '../context/DemoWalletContext';
import WebApp from '@twa-dev/sdk';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';

export default function Gifts() {
  const navigate = useNavigate();
  const address = useTonAddress();
  const { credit, enabled, spend, demoBalance } = useDemoWallet();
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'send' | 'sent'
  const [gifts, setGifts] = useState([]);
  const [sentGifts, setSentGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoConvert, setAutoConvert] = useState(false);
  const [selected, setSelected] = useState(null);
  const [choice, setChoice] = useState(null); // 'TON' | 'NGN'
  const [summary, setSummary] = useState(null);
  
  // Send gift form
  const [sendForm, setSendForm] = useState({
    recipientUsername: '',
    amountTON: '',
    message: '',
    expiresInDays: 30
  });
  
  // Get Telegram user info
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    const addr = address || getMockAddress();
    fetchGifts(addr);
    fetchSentGifts(addr);
    
    // Get Telegram user info
    try {
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        setTelegramUser({
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name
        });
      }
    } catch (e) {
      console.log('Telegram user info not available');
    }
  }, [address]);

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

  const fetchGifts = async (addr, merge = false) => {
    try {
      if (!addr) {
        console.warn('No address provided for fetching gifts');
        if (!merge) setGifts([]);
        return;
      }
      const params = new URLSearchParams({ address: addr });
      if (telegramUser?.id) params.append('telegramId', telegramUser.id.toString());
      console.log('Fetching gifts with params:', params.toString());
      const res = await axios.get(`/api/gifts?${params}`);
      console.log('Fetched gifts response:', res.data);
      console.log('Fetched gifts count:', res.data.gifts?.length || 0);
      
      if (merge) {
        // Merge with existing gifts, avoiding duplicates
        setGifts(prev => {
          const fetchedGifts = res.data.gifts || [];
          const existingIds = new Set(prev.map(g => g._id));
          const newGifts = fetchedGifts.filter(g => !existingIds.has(g._id));
          return [...prev, ...newGifts];
        });
      } else {
        setGifts(res.data.gifts || []);
      }
      
      if (res.data.gifts && res.data.gifts.length === 0) {
        console.warn('No gifts found for address:', addr);
      }
    } catch (error) {
      console.error('Fetch gifts error:', error);
      console.error('Error details:', error.response?.data);
      if (!merge) {
        toast.error('Failed to fetch gifts: ' + (error.response?.data?.error || error.message));
        setGifts([]);
      }
    }
  };

  const fetchSentGifts = async (addr) => {
    try {
      const params = new URLSearchParams({ address: addr });
      if (telegramUser?.id) params.append('telegramId', telegramUser.id);
      const res = await axios.get(`/api/gifts/sent?${params}`);
      setSentGifts(res.data.gifts || []);
    } catch (error) {
      console.error('Fetch sent gifts error:', error);
    }
  };

  const createDemoGift = async () => {
    const addr = address || getMockAddress();
    if (!addr) {
      toast.error('Please connect a wallet first');
      return;
    }
    setLoading(true);
    try {
      console.log('Creating demo gift for address:', addr);
      const res = await axios.post('/api/gifts/webhook', {
        recipientAddress: addr,
        senderAddress: 'EQ' + 'D'.repeat(46),
        amountTON: 2.5,
        message: 'Demo gift from Telegram'
      });
      console.log('Demo gift created response:', res.data);
      if (res.data.success) {
        const createdGift = res.data.gift;
        console.log('Created gift details:', createdGift);
        toast.success('🎁 Demo gift created successfully!');
        
        // Immediately add to local state for instant display
        if (createdGift) {
          setGifts(prev => {
            const exists = prev.find(g => g._id === createdGift._id || g._id === createdGift.id);
            if (!exists) {
              return [createdGift, ...prev];
            }
            return prev;
          });
        }
        
        // Switch to received tab immediately to see the new gift
        setActiveTab('received');
        
        // Refresh gifts list with a delay to merge with backend (don't replace, merge)
        setTimeout(async () => {
          await fetchGifts(addr, true); // Merge mode - won't clear existing gifts
        }, 1000);
      } else {
        toast.error('Failed to create gift: ' + (res.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Create demo gift error:', error);
      if (error.response) {
        toast.error(`Error: ${error.response.data?.error || error.response.data?.message || 'Server error'}`);
      } else if (error.request) {
        toast.error('Error: Cannot connect to server. Make sure the backend is running on port 5000.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const openConvert = (gift, to) => {
    console.log('Opening convert modal for gift:', {
      id: gift._id,
      status: gift.status,
      converted: gift.converted,
      recipientAddress: gift.recipientAddress
    });
    
    // Ensure gift has status (default to 'sent' if missing)
    const giftWithStatus = {
      ...gift,
      status: gift.status || 'sent'
    };
    
    setSelected(giftWithStatus);
    setChoice(to);
    setSummary(null);
  };

  const handleSendGift = async (e) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!sendForm.recipientUsername || (!sendForm.recipientUsername.startsWith('@') && !sendForm.recipientUsername.match(/^[a-zA-Z0-9_]{5,32}$/))) {
      toast.error('Please enter a valid Telegram username (e.g., @username or username)');
      return;
    }
    
    // Ensure username starts with @
    const formattedUsername = sendForm.recipientUsername.startsWith('@') 
      ? sendForm.recipientUsername 
      : `@${sendForm.recipientUsername}`;
    
    if (!sendForm.amountTON || parseFloat(sendForm.amountTON) < 0.01) {
      toast.error('Amount must be at least 0.01 TON');
      return;
    }

    // Check balance
    let balance = 0;
    if (enabled) {
      balance = demoBalance;
    } else if (address) {
      const { getBalance } = await import('../services/ton');
      const result = await getBalance(address);
      balance = result.balance || 0;
    }
    
    if (balance < parseFloat(sendForm.amountTON)) {
      toast.error(`Insufficient balance. You have ${balance.toFixed(2)} TON, but need ${parseFloat(sendForm.amountTON).toFixed(2)} TON`);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/gifts/send', {
        senderAddress: address,
        senderTelegramId: telegramUser?.id?.toString(),
        recipientTelegramUsername: formattedUsername,
        amountTON: parseFloat(sendForm.amountTON),
        message: sendForm.message,
        expiresInDays: sendForm.expiresInDays
      });

      if (res.data.success) {
        // Deduct from balance
        if (enabled) {
          spend(parseFloat(sendForm.amountTON));
        }
        
        toast.success(`🎁 ${res.data.message || 'Gift sent successfully!'}`);
        
        // Reset form
        setSendForm({
          recipientUsername: '',
          amountTON: '',
          message: '',
          expiresInDays: 30
        });
        
        // Refresh lists
        fetchGifts(address || getMockAddress());
        fetchSentGifts(address || getMockAddress());
        
        // Switch to sent tab
        setActiveTab('sent');
      } else {
        toast.error('Failed to send gift: ' + (res.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Send gift error:', error);
      if (error.response) {
        toast.error('Failed to send gift: ' + (error.response.data?.error || error.response.data?.message || 'Server error'));
      } else if (error.request) {
        toast.error('Error: Cannot connect to server. Make sure the backend is running.');
      } else {
        toast.error('Failed to send gift: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmConvert = async () => {
    if (!selected || !choice) return;
    
    // If converting to NGN, redirect to Send to Bank page
    if (choice === 'NGN') {
      // Close the modal first
      setSelected(null);
      setChoice(null);
      setSummary(null);
      
      // Navigate to Send to Bank with pre-filled amount
      navigate('/send-to-bank', {
        state: {
          giftAmount: selected.amountTON.toString(),
          giftId: selected._id,
          fromGift: true
        }
      });
      return;
    }
    
    // For TON conversion, process immediately
    setLoading(true);
    const loadingToast = toast.loading('Converting gift to TON...');
    try {
      const addrToUse = address || getMockAddress();
      if (!addrToUse) {
        toast.dismiss(loadingToast);
        toast.error('Please connect a wallet first');
        setLoading(false);
        return;
      }
      
      console.log('Converting gift:', {
        giftId: selected._id,
        giftStatus: selected.status,
        giftConverted: selected.converted,
        address: addrToUse,
        recipientAddress: selected.recipientAddress
      });
      
      const res = await axios.post('/api/gifts/convert', {
        giftId: selected._id,
        toCurrency: 'TON',
        address: addrToUse
      }, {
        timeout: 10000
      });
      
      toast.dismiss(loadingToast);
      
      if (res.data?.success) {
        setSummary({ ...res.data.summary, sender: selected.senderAddress || res.data.summary?.sender });
        toast.success('🎁 Gift converted to TON successfully!');
        
        // Credit demo TON so it becomes usable across pages
        const credited = Number(res.data.summary?.valueReceived || selected.amountTON || 0);
        if (enabled && credited > 0) {
          credit(credited);
          toast.success(`💰 ${credited.toFixed(2)} TON has been added to your wallet!`);
        } else if (address) {
          toast.success('💰 TON has been sent to your connected wallet!');
        }
        
        await fetchGifts(addrToUse);
        // Close modal after a short delay
        setTimeout(() => {
          setSelected(null);
          setChoice(null);
          setSummary(null);
        }, 1500);
      } else {
        toast.error('Conversion failed: ' + (res.data?.error || 'Unknown error'));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Convert error:', error);
      if (error.response) {
        toast.error('Conversion failed: ' + (error.response.data?.error || error.response.data?.message || 'Server error'));
      } else if (error.request) {
        toast.error('Error: Cannot connect to server. Make sure the backend is running.');
      } else {
        toast.error('Conversion failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-4 safe-area-padding app-gradient min-h-screen">
      <h2 className="text-2xl font-bold">Gifts</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'received'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
        >
          📥 Received
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'send'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
        >
          🎁 Send Gift
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'sent'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600'
          }`}
        >
          📤 Sent
        </button>
      </div>

      {/* Wallet Connection */}
      <div className="tp-card p-4">
        <div className="mb-4">
          <TonConnectButton />
        </div>
        {address && (
          <>
            <p className="text-sm opacity-70 mb-4">Connected: {address.slice(0, 10)}...</p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
              />
              <span className="text-sm">Auto-convert gifts to Naira</span>
            </label>
          </>
        )}
      </div>

      {/* Send Gift Tab */}
      {activeTab === 'send' && (
        <div className="tp-card p-4 space-y-4">
          <h3 className="text-xl font-bold">Send a Gift</h3>
          <p className="text-sm opacity-70">Send TON as a gift to someone via Telegram</p>

          <form onSubmit={handleSendGift} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Telegram Username
              </label>
              <input
                type="text"
                required
                value={sendForm.recipientUsername}
                onChange={(e) => setSendForm({ ...sendForm, recipientUsername: e.target.value })}
                className="tp-input w-full"
                placeholder="@username"
                pattern="^@?[a-zA-Z0-9_]{5,32}$"
              />
              <p className="text-xs opacity-60 mt-1">
                Enter the Telegram username of the person you want to gift (e.g., @john_doe)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount (TON)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={sendForm.amountTON}
                onChange={(e) => setSendForm({ ...sendForm, amountTON: e.target.value })}
                className="tp-input w-full"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                className="tp-input w-full"
                rows="3"
                placeholder="Add a personal message..."
                maxLength={500}
              />
              <p className="text-xs opacity-60 mt-1">
                {sendForm.message.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Gift Expires In (Days)
              </label>
              <select
                value={sendForm.expiresInDays}
                onChange={(e) => setSendForm({ ...sendForm, expiresInDays: parseInt(e.target.value) })}
                className="tp-input w-full"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !address}
              className="w-full tp-btn tp-button-primary disabled:opacity-50"
            >
              {loading ? 'Sending...' : '🎁 Send Gift'}
            </button>
          </form>

          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <p className="font-semibold mb-1">💡 How it works:</p>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>Enter the recipient's Telegram username</li>
              <li>They'll receive a notification in Telegram</li>
              <li>They can claim the gift and convert to TON or NGN</li>
              <li>Gift expires if not claimed within the selected time</li>
            </ul>
          </div>
        </div>
      )}

      {/* Received Gifts Tab */}
      {activeTab === 'received' && (
      <div className="tp-card p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Received Gifts</h3>
          <button onClick={createDemoGift} disabled={loading} className="tp-btn tp-button-primary text-xs px-3 py-1 disabled:opacity-50">
            {loading ? '...' : '+ Demo Gift'}
          </button>
        </div>
        {gifts.length === 0 ? (
          <EmptyState
            icon="🎁"
            title="No Gifts Received"
            message="Gifts sent to you will appear here. You can also create a demo gift to test the feature."
            action={createDemoGift}
            actionLabel="Create Demo Gift"
          />
        ) : (
          <div className="space-y-4">
            {gifts.map((gift) => (
              <div key={gift._id} className="tp-card p-4 tone-gift">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{gift.amountTON} TON</p>
                    <p className="text-sm text-gray-600">≈ ₦{gift.amountNGN?.toLocaleString('en-NG')}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(gift.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {gift.message && (
                  <p className="text-sm text-gray-600 italic mb-2">"{gift.message}"</p>
                )}
                <div className="flex gap-2">
                  {!gift.converted ? (
                    <>
                      <button
                        onClick={() => openConvert(gift, 'TON')}
                        className="flex-1 tp-btn tp-button-primary text-sm"
                        disabled={loading}
                      >
                        Convert to TON
                      </button>
                      <button
                        onClick={() => openConvert(gift, 'NGN')}
                        className="flex-1 tp-btn tone-airtime text-sm"
                        disabled={loading}
                      >
                        Convert to Naira
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 opacity-70 text-sm">
                      ✓ Converted to {gift.convertedTo}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Sent Gifts Tab */}
      {activeTab === 'sent' && (
        <div className="tp-card p-4">
          <h3 className="font-bold mb-4">Sent Gifts</h3>
          {sentGifts.length === 0 ? (
            <EmptyState
              icon="📤"
              title="No Gifts Sent"
              message="You haven't sent any gifts yet. Send your first gift to share TON with friends!"
              action={() => setActiveTab('send')}
              actionLabel="Send Your First Gift"
            />
          ) : (
            <div className="space-y-4">
              {sentGifts.map((gift) => (
                <div key={gift._id} className="tp-card p-4 tone-gift">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{gift.amountTON} TON</p>
                      <p className="text-sm text-gray-600">≈ ₦{gift.amountNGN?.toLocaleString('en-NG')}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        To: {gift.recipientTelegramUsername || gift.recipientAddress?.slice(0, 10) || 'Unknown'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      gift.status === 'claimed' ? 'bg-green-100 text-green-800' :
                      gift.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      gift.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {gift.status}
                    </span>
                  </div>
                  {gift.message && (
                    <p className="text-sm text-gray-600 italic mb-2">"{gift.message}"</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(gift.createdAt).toLocaleDateString()}</span>
                    {gift.claimLink && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(gift.claimLink);
                          toast.success('Claim link copied!');
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Copy Link
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conversion Modal */}
      {(selected && choice) && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => { setSelected(null); setChoice(null); setSummary(null); }} />
          <div className="bottom-sheet open safe-area-bottom">
            <div className="handle" />
            <div className="px-4 pb-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4 gap-3">
                <h3 className="text-xl font-bold">Confirm Conversion</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelected(null); setChoice(null); setSummary(null); }} 
                    className="tp-btn tp-button-muted text-sm px-3 py-2"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmConvert} 
                    disabled={loading} 
                    className="tp-btn tp-button-primary disabled:opacity-50 text-sm px-3 py-2"
                  >
                    {loading ? 'Converting...' : 'Confirm & Convert'}
                  </button>
                </div>
              </div>
              <div className="tp-card p-4 space-y-3 mb-4">
                <div className="flex justify-between py-2 border-b border-white/10"><span className="text-sm opacity-70">Sender</span><span className="font-semibold">{selected.senderAddress || 'Unknown'}</span></div>
                <div className="flex justify-between py-2 border-b border-white/10"><span className="text-sm opacity-70">Gift Amount</span><span className="font-semibold">{selected.amountTON} TON</span></div>
                <div className="flex justify-between py-2"><span className="text-sm opacity-70">Convert To</span><span className="font-semibold">{choice === 'NGN' ? 'Naira' : 'TON'}</span></div>
              </div>

              {summary && (
                <div className="tp-card p-3 mb-4">
                  <p className="text-sm">Final Value Received: <span className="font-semibold">{choice === 'NGN' ? `₦${Number(summary.valueReceived).toLocaleString('en-NG')}` : `${summary.valueReceived} TON`}</span></p>
                  <p className="text-xs opacity-70 mt-1">{new Date(summary.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

