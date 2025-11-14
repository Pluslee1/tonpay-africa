import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import axios from 'axios';
import { addHistory } from '../services/history';
import { useDemoWallet } from '../context/DemoWalletContext';
import { useAuth } from '../context/AuthContext';
import { getBalance } from '../services/ton';
import toast from 'react-hot-toast';
import SuccessScreen from '../components/SuccessScreen';
import { validateAmount, validateAccountNumber } from '../utils/validation';

export default function SendToBank() {
  const navigate = useNavigate();
  const location = useLocation();
  const address = useTonAddress();
  const { demoBalance, spend, credit, enabled } = useDemoWallet();
  const { user } = useAuth();

  // Get pre-filled amount from location state (for gift conversion)
  const giftAmount = location.state?.giftAmount;
  const giftId = location.state?.giftId;
  const fromGift = location.state?.fromGift || false;

  const [step, setStep] = useState(1); // 1: form, 2: confirmation, 3: success
  const [formData, setFormData] = useState({
    amountTON: giftAmount || '',
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  const [errors, setErrors] = useState({});
  const [transactionId, setTransactionId] = useState(null);
  const [rate, setRate] = useState(2000);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const mockAddress = () => 'EQA'.padEnd(48, 'A');

  useEffect(() => {
    fetchRate();
    fetchBalance();
    // If coming from gift conversion, pre-fill amount
    if (giftAmount) {
      setFormData(prev => ({ ...prev, amountTON: giftAmount }));
    }
  }, [address, demoBalance, enabled, giftAmount]);

  const fetchRate = async () => {
    try {
      const res = await axios.get('/api/rate');
      setRate(res.data.rate);
    } catch (error) {
      console.error('Rate fetch error:', error);
    }
  };

  const fetchBalance = async () => {
    if (enabled) {
      setBalance(demoBalance);
    } else if (address) {
      try {
        const res = await getBalance(address);
        setBalance(res?.balance || 0);
      } catch {
        setBalance(0);
      }
    } else {
      setBalance(0);
    }
  };

  const handleVerifyAccount = async () => {
    if (!formData.bankCode || !formData.accountNumber || formData.accountNumber.length < 10) {
      return;
    }

    setVerifying(true);
    try {
      const res = await axios.post('/api/verify-account', {
        bankCode: formData.bankCode,
        accountNumber: formData.accountNumber
      });

      if (res.data.success) {
        setFormData({ ...formData, accountName: res.data.accountName || res.data.data?.accountName });
        toast.success('Account verified successfully!');
        setErrors({ ...errors, accountNumber: null });
      } else {
        toast.error('Account verification failed: ' + (res.data.error || 'Unknown error'));
        setErrors({ ...errors, accountNumber: 'Verification failed' });
      }
    } catch (error) {
      console.error('Verification error:', error);
      if (error.response) {
        toast.error('Verification failed: ' + (error.response.data?.error || error.response.data?.message || 'Server error'));
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check your connection.');
      } else {
        toast.error('Verification error: ' + error.message);
      }
      setErrors({ ...errors, accountNumber: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate amount
    const amountValidation = validateAmount(formData.amountTON, 0.01);
    if (!amountValidation.valid) {
      newErrors.amountTON = amountValidation.error;
      toast.error(amountValidation.error);
      return;
    }

    const amountTON = parseFloat(formData.amountTON);
    const amountNGN = amountTON * rate;

    // Check transfer limit (50,000 NGN) - require registration
    if (amountNGN > 50000) {
      if (!user) {
        toast.error('Transfers above ₦50,000 require registration. Please register first.');
        setErrors({ ...newErrors, registrationRequired: true });
        return;
      }
      // Check KYC status if registered
      if (user.kyc?.status !== 'verified') {
        toast.error('Transfers above ₦50,000 require KYC verification. Please complete KYC first.');
        setErrors({ ...newErrors, kycRequired: true });
        return;
      }
    }

    if (!fromGift && amountTON > balance) {
      // Skip balance check if converting from gift (gift amount is available)
      newErrors.amountTON = 'Insufficient balance';
      toast.error('Insufficient balance');
    }

    // Validate account number
    if (!formData.accountNumber || !validateAccountNumber(formData.accountNumber)) {
      newErrors.accountNumber = 'Invalid account number';
    }

    if (!formData.accountName) {
      newErrors.accountName = 'Please verify account number first';
      toast.error('Please verify account number first');
    }

    if (!formData.bankCode) {
      newErrors.bankCode = 'Please select a bank';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Processing transfer request...');
    try {
      const amountTON = parseFloat(formData.amountTON);
      // Only deduct from balance if not from gift conversion
      // Gift conversion uses the gift amount, not user's balance
      if (enabled && !fromGift) {
        if (!spend(amountTON)) {
          toast.dismiss(loadingToast);
          toast.error('Insufficient balance');
          setLoading(false);
          return;
        }
      }
      const amountNGN = amountTON * rate;
      const walletAddr = address || mockAddress();
      
      const res = await axios.post('/api/transaction/convert', {
        walletAddress: walletAddr,
        amountTON: amountTON,
        amountNGN: amountNGN,
        bankDetails: {
          bankName: formData.bankName,
          bankCode: formData.bankCode,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName
        }
      }, {
        timeout: 10000 // 10 second timeout
      });

      toast.dismiss(loadingToast);
      
      if (res.data && res.data.success === true) {
        setTransactionId(res.data.transaction?._id || res.data.transaction?.id || res.data.transactionId);
        
        // If this was from a gift conversion, mark the gift as converted
        if (fromGift && giftId) {
          try {
            await axios.post('/api/gifts/convert', {
              giftId: giftId,
              toCurrency: 'NGN',
              address: walletAddr
            });
            console.log('Gift marked as converted');
          } catch (error) {
            console.error('Failed to mark gift as converted:', error);
            // Don't fail the transaction if gift update fails
          }
        }
        
        addHistory({
          section: 'transfer',
          title: fromGift ? 'Gift Converted to Bank' : 'Send to Bank',
          amountTON: amountTON,
          amountNGN: amountNGN,
          note: `${formData.bankName} • ${formData.accountNumber}`,
          meta: {
            bankName: formData.bankName,
            bankCode: formData.bankCode,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
            walletAddress: walletAddr,
            fromGift: fromGift,
            giftId: giftId
          }
        });
        toast.success(fromGift ? '🎁 Gift converted and transfer submitted!' : 'Transfer request submitted successfully!');
        setLoading(false); // Reset loading before changing step
        // Small delay to ensure state updates
        setTimeout(() => {
          setStep(3);
        }, 100);
      } else {
        if (enabled) credit(amountTON);
        toast.error('Request failed: ' + (res.data?.error || 'Unknown error'));
        setLoading(false);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Transaction error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error request:', error.request);
      const amt = parseFloat(formData.amountTON);
      if (enabled && Number.isFinite(amt) && amt > 0) credit(amt);
      
      // Better error handling
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else if (error.response) {
        const errorMsg = error.response.data?.error || error.response.data?.message || 'Server error';
        toast.error('Request failed: ' + errorMsg);
        console.error('Server error response:', error.response.data);
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check your connection and make sure the backend is running.');
      } else {
        toast.error('Request failed: ' + error.message);
      }
      setLoading(false);
    }
  };

  const banks = [
    { code: '044', name: 'Access Bank' },
    { code: '050', name: 'Ecobank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '011', name: 'First Bank' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '030', name: 'Heritage Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '526', name: 'Parallex Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '221', name: 'Stanbic IBTC' },
    { code: '068', name: 'Standard Chartered' },
    { code: '232', name: 'Sterling Bank' },
    { code: '100', name: 'Suntrust Bank' },
    { code: '032', name: 'Union Bank' },
    { code: '033', name: 'United Bank For Africa' },
    { code: '215', name: 'Unity Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '057', name: 'Zenith Bank' }
  ];

  if (step === 3) {
    return (
      <SuccessScreen
        icon="✅"
        title="Transfer Request Received!"
        message="Your payout request has been received and is being processed. You'll receive a notification once it's completed."
        transactionId={transactionId}
        amountTON={parseFloat(formData.amountTON)}
        amountNGN={parseFloat(formData.amountTON) * rate}
        details={{
          'Bank': formData.bankName,
          'Account Number': formData.accountNumber,
          'Account Name': formData.accountName,
        }}
        primaryAction={() => navigate('/')}
        primaryLabel="Go to Dashboard"
        secondaryAction={() => navigate('/history')}
        secondaryLabel="View History"
      />
    );
  }

  if (step === 2) {
    const amountNGN = parseFloat(formData.amountTON) * rate;
    const fee = amountNGN * 0.02;
    const finalNGN = amountNGN - fee;

    return (
      <>
        <div className="bottom-sheet-backdrop" onClick={() => setStep(1)} />
        <div className="bottom-sheet open safe-area-bottom">
          <div className="handle" />
          <div className="px-4 pb-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 gap-3">
              <h2 className="text-xl font-bold">Confirm Payout</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="tp-btn tp-button-muted text-sm px-3 py-2"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="tp-btn tp-button-primary disabled:opacity-50 text-sm px-3 py-2"
                >
                  {loading ? 'Processing...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
            
            <div className="tp-card p-4 space-y-3 mb-4">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Amount (TON)</span>
                <span className="font-semibold">{formData.amountTON} TON</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Amount (NGN)</span>
                <span className="font-semibold">₦{finalNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Fee (2%)</span>
                <span className="font-semibold">₦{fee.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Bank</span>
                <span className="font-semibold">{formData.bankName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Account Number</span>
                <span className="font-semibold">{formData.accountNumber}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm opacity-70">Account Name</span>
                <span className="font-semibold">{formData.accountName}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 px-4 py-4 safe-area-padding app-gradient min-h-screen">
            <h2 className="text-2xl font-bold">{fromGift ? 'Convert Gift to Naira' : 'Send to Bank'}</h2>
             {fromGift && (
               <div className="tp-card p-3 bg-blue-50 border border-blue-200">
                 <p className="text-sm text-blue-800">
                   🎁 Converting gift of <strong>{giftAmount} TON</strong> to Naira. Please enter your bank details below.
                 </p>
               </div>
             )}
             {errors.registrationRequired && (
               <div className="tp-card p-4 bg-yellow-50 border border-yellow-200">
                 <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Registration Required</p>
                 <p className="text-sm text-yellow-700 mb-3">
                   Transfers above ₦50,000 require registration. Please create an account to continue.
                 </p>
                 <Link to="/register" className="tp-btn tp-button-primary text-sm px-4 py-2 inline-block">
                   Register Now
                 </Link>
               </div>
             )}
             {errors.kycRequired && (
               <div className="tp-card p-4 bg-yellow-50 border border-yellow-200">
                 <p className="text-sm font-semibold text-yellow-800 mb-2">🔐 KYC Verification Required</p>
                 <p className="text-sm text-yellow-700 mb-3">
                   Transfers above ₦50,000 require KYC verification. Please complete your identity verification.
                 </p>
                 <Link to="/settings?tab=kyc" className="tp-btn tp-button-primary text-sm px-4 py-2 inline-block">
                   Complete KYC
                 </Link>
               </div>
             )}

      <div className="tp-card p-4">
        <div className="flex justify-center mb-4">
          <TonConnectButton />
        </div>
        <p className="text-center text-sm opacity-70">
          {address ? 'Wallet connected' : 'You can connect a wallet (optional)'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="tp-card p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (TON)</label>
            <input
            type="number"
            step="0.01"
            min="0.01"
            max={balance > 0 ? balance : undefined}
            required
            value={formData.amountTON}
            onChange={(e) => setFormData({ ...formData, amountTON: e.target.value })}
            className="tp-input w-full"
            placeholder="0.00"
            readOnly={fromGift} // Lock amount if from gift conversion
          />
            <div className="mt-2 text-lg font-semibold text-[var(--tg-theme-text-color)]">
              ≈ ₦{formData.amountTON ? (parseFloat(formData.amountTON) * rate).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
            {!fromGift && (
              <p className="text-xs opacity-70 mt-1">Available: {balance.toFixed(2)} TON</p>
            )}
            {fromGift && (
              <p className="text-xs opacity-70 mt-1 text-green-600">💰 Gift amount: {giftAmount} TON</p>
            )}
            <p className="text-xs opacity-60">Rate: 1 TON = ₦{rate.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bank Name</label>
            <select
            required
            value={formData.bankCode}
            onChange={(e) => {
                const bank = banks.find(b => b.code === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  bankCode: e.target.value,
                  bankName: bank?.name || ''
                }));
                setErrors({ ...errors, bankCode: null });
                // Re-verify if account number is already complete
                setTimeout(() => {
                  if ((formData.accountNumber || '').length === 10) {
                    handleVerifyAccount();
                  }
                }, 0);
              }}
            className={`tp-input w-full ${errors.bankCode ? 'border-red-500' : ''}`}
          >
              <option value="">Select Bank</option>
              {banks.map(bank => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Account Number</label>
            <input
              type="text"
              pattern="[0-9]{10}"
              required
              value={formData.accountNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, accountNumber: val, accountName: '' });
                setErrors({ ...errors, accountNumber: null });
                if (val && val.length === 10 && formData.bankCode) {
                  handleVerifyAccount();
                }
              }}
              onBlur={handleVerifyAccount}
              className={`tp-input w-full ${errors.accountNumber ? 'border-red-500' : ''}`}
              placeholder="0001234567"
            />
            {errors.accountNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.accountNumber}</p>
            )}
            {verifying && (
              <p className="text-sm text-gray-500 mt-1">Verifying...</p>
            )}
            {formData.accountName && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-semibold">✓ Verified</p>
                <p className="text-sm text-gray-700">{formData.accountName}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!formData.accountName || verifying || !formData.bankCode || !formData.accountNumber || formData.accountNumber.length < 10}
            className="w-full tp-btn tp-button-primary disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Continue'}
          </button>
        </form>
    </div>
  );
}
