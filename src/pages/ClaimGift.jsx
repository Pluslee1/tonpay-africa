import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import axios from 'axios';
import { useDemoWallet } from '../context/DemoWalletContext';
import WebApp from '@twa-dev/sdk';

export default function ClaimGift() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const address = useTonAddress();
  const { credit, enabled } = useDemoWallet();
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    if (!token) {
      alert('Invalid gift link');
      navigate('/gifts');
      return;
    }

    fetchGift();
    
    // Get Telegram user info
    try {
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        setTelegramUser({
          id: user.id,
          username: user.username
        });
      }
    } catch (e) {
      console.log('Telegram user info not available');
    }
  }, [token]);

  const fetchGift = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`/api/gifts/claim/${token}`);
      if (res.data.success) {
        setGift(res.data.gift);
      } else {
        alert('Gift not found');
        navigate('/gifts');
      }
    } catch (error) {
      console.error('Fetch gift error:', error);
      if (error.response?.status === 404) {
        alert('Gift not found or already claimed');
        navigate('/gifts');
      } else {
        alert('Error loading gift: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!address && !telegramUser?.id) {
      alert('Please connect your wallet or ensure you\'re logged in via Telegram');
      return;
    }

    setClaiming(true);
    try {
      const res = await axios.post('/api/gifts/claim', {
        claimToken: token,
        recipientAddress: address,
        recipientTelegramId: telegramUser?.id?.toString()
      });

      if (res.data.success) {
        alert('🎁 Gift claimed successfully! You can now convert it to TON or NGN.');
        navigate('/gifts');
      } else {
        alert('Failed to claim gift: ' + (res.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Claim error:', error);
      if (error.response) {
        alert('Failed to claim gift: ' + (error.response.data?.error || error.response.data?.message || 'Server error'));
      } else {
        alert('Failed to claim gift: ' + error.message);
      }
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p>Loading gift...</p>
        </div>
      </div>
    );
  }

  if (!gift) {
    return null;
  }

  const isExpired = new Date(gift.expiresAt) < new Date();
  const isClaimed = gift.status === 'claimed';
  const canClaim = !isExpired && !isClaimed && (gift.status === 'sent' || gift.status === 'pending');

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-4 safe-area-padding app-gradient min-h-screen">
      <h2 className="text-2xl font-bold">🎁 Claim Your Gift</h2>

      <div className="tp-card p-6 text-center">
        {isExpired ? (
          <>
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-xl font-bold mb-2 text-red-600">Gift Expired</h3>
            <p className="text-sm opacity-70">
              This gift expired on {new Date(gift.expiresAt).toLocaleDateString()}
            </p>
          </>
        ) : isClaimed ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2 text-green-600">Already Claimed</h3>
            <p className="text-sm opacity-70">
              This gift was already claimed on {new Date(gift.claimedAt).toLocaleDateString()}
            </p>
            <button
              onClick={() => navigate('/gifts')}
              className="tp-btn tp-button-primary mt-4"
            >
              View My Gifts
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold mb-2">{gift.amountTON} TON</h3>
            <p className="text-lg opacity-80 mb-4">
              ≈ ₦{gift.amountNGN?.toLocaleString('en-NG') || 'N/A'}
            </p>

            {gift.message && (
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-sm opacity-70 mb-1">Message from sender:</p>
                <p className="font-semibold">"{gift.message}"</p>
              </div>
            )}

            <div className="space-y-2 mb-6 text-left">
              <div className="flex justify-between">
                <span className="text-sm opacity-70">From:</span>
                <span className="font-semibold">
                  {gift.senderTelegramUsername || gift.senderAddress?.slice(0, 10) || 'Anonymous'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm opacity-70">Expires:</span>
                <span className="font-semibold">
                  {new Date(gift.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {!address && (
              <div className="mb-4">
                <p className="text-sm opacity-70 mb-3">
                  Connect your wallet to claim this gift
                </p>
                <TonConnectButton />
              </div>
            )}

            {canClaim && (
              <button
                onClick={handleClaim}
                disabled={claiming || !address}
                className="w-full tp-btn tp-button-primary disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : '🎁 Claim Gift'}
              </button>
            )}

            {address && canClaim && (
              <p className="text-xs opacity-60 mt-4">
                After claiming, you can convert this gift to TON or NGN in your gifts page
              </p>
            )}
          </>
        )}
      </div>

      <div className="tp-card p-4">
        <h3 className="font-bold mb-2">What happens after claiming?</h3>
        <ul className="text-sm space-y-2 opacity-80">
          <li>✅ Gift will appear in your "Received Gifts"</li>
          <li>💰 You can convert it to TON (crypto) or NGN (Naira)</li>
          <li>🎯 Conversion happens instantly</li>
          <li>📊 Transaction will be recorded in your history</li>
        </ul>
      </div>
    </div>
  );
}

