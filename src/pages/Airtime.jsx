import { useState, useEffect } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import axios from 'axios';
import { addHistory } from '../services/history';
import { useDemoWallet } from '../context/DemoWalletContext';
import { getBalance } from '../services/ton';
import toast from 'react-hot-toast';
import SuccessScreen from '../components/SuccessScreen';
import { validateAmount, validatePhone } from '../utils/validation';

export default function Airtime() {
  const address = useTonAddress();
  const { demoBalance, spend, enabled } = useDemoWallet();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    network: '',
    amountTON: ''
  });
  const [rate, setRate] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const mockAddress = () => 'EQA'.padEnd(48, 'A');

  useEffect(() => {
    fetchRate();
    fetchBalance();
  }, [address, demoBalance, enabled]);

  const fetchRate = async () => {
    try {
      const res = await axios.get('/api/rate');
      setRate(res.data.rate);
    } catch (error) {}
  };

  const fetchBalance = async () => {
    if (enabled) {
      setBalance(demoBalance);
    } else if (address) {
      try {
        const result = await getBalance(address);
        setBalance(result?.balance || 0);
      } catch {
        setBalance(0);
      }
    } else {
      setBalance(0);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address, enabled, demoBalance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.network) {
      toast.error('Please select a network');
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast.error('Enter a valid phone number');
      return;
    }
    const amountValidation = validateAmount(formData.amountTON, 0.01);
    if (!amountValidation.valid) {
      toast.error(amountValidation.error);
      return;
    }
    if (parseFloat(formData.amountTON) > balance) {
      toast.error('Insufficient balance');
      return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Processing airtime purchase...');
    try {
      const walletAddr = address || mockAddress();
      const amountTON = parseFloat(formData.amountTON);
      if (enabled) {
        if (!spend(amountTON)) {
          toast.dismiss(loadingToast);
          toast.error('Insufficient balance');
          setLoading(false);
          return;
        }
      }
      const amountNGN = amountTON * rate;
      
      // Simulate API call (in production, this would call actual airtime API)
      await new Promise(r => setTimeout(r, 1500));
      
      addHistory({
        section: 'airtime',
        title: `${formData.network} Airtime`,
        amountTON: amountTON,
        amountNGN: amountNGN,
        note: formData.phone,
        meta: { phone: formData.phone, network: formData.network, walletAddress: walletAddr }
      });
      
      toast.dismiss(loadingToast);
      toast.success('Airtime purchased successfully!');
      setLoading(false); // Reset loading before changing step
      // Small delay to ensure state updates
      setTimeout(() => {
        setStep(3);
      }, 200);
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error('Failed to process airtime request: ' + (e.message || 'Unknown error'));
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <SuccessScreen
        icon="📱"
        title="Airtime Purchased!"
        message={`${formData.amountTON} TON airtime has been sent to ${formData.phone}`}
        amountTON={parseFloat(formData.amountTON)}
        amountNGN={parseFloat(formData.amountTON) * rate}
        details={{
          'Network': formData.network,
          'Phone Number': formData.phone,
        }}
        primaryAction={() => window.location.href = '/'}
        primaryLabel="Go to Dashboard"
        secondaryAction={() => setStep(1)}
        secondaryLabel="Buy More"
      />
    );
  }

  if (step === 2) {
    const amountNGN = parseFloat(formData.amountTON) * rate;
    const fee = amountNGN * 0.01;
    const finalNGN = amountNGN + fee;

    return (
      <>
        <div className="bottom-sheet-backdrop" onClick={() => setStep(1)} />
        <div className="bottom-sheet open safe-area-bottom">
          <div className="handle" />
          <div className="px-4 pb-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 gap-3">
              <h2 className="text-xl font-bold">Confirm Airtime Purchase</h2>
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
                  {loading ? 'Processing...' : 'Confirm & Buy'}
                </button>
              </div>
            </div>
            
            <div className="tp-card p-4 space-y-3 mb-4">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Phone</span>
                <span className="font-semibold">{formData.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Network</span>
                <span className="font-semibold">{formData.network}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Amount (TON)</span>
                <span className="font-semibold">{formData.amountTON} TON</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm opacity-70">Amount (NGN)</span>
                <span className="font-semibold">₦{finalNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 px-4 py-4 safe-area-padding app-gradient min-h-screen">
      <h2 className="text-2xl font-bold">Buy Airtime</h2>

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
          <label className="block text-sm font-medium mb-2">Network</label>
          <select
            required
            value={formData.network}
            onChange={(e) => setFormData({ ...formData, network: e.target.value })}
            className="tp-input w-full"
          >
            <option value="">Select Network</option>
            <option value="MTN">MTN</option>
            <option value="Airtel">Airtel</option>
            <option value="Glo">Glo</option>
            <option value="9mobile">9mobile</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="tp-input w-full"
            placeholder="e.g. 08012345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Amount (TON)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={formData.amountTON}
            onChange={(e) => {
              const val = e.target.value;
              if (balance > 0 && parseFloat(val) > balance) {
                toast.error(`Amount cannot exceed your balance of ${balance.toFixed(2)} TON`);
                return;
              }
              setFormData({ ...formData, amountTON: val });
            }}
            className="tp-input w-full"
            placeholder="0.00"
          />
          <div className="mt-2 text-lg font-semibold text-[var(--tg-theme-text-color)]">
            ≈ ₦{formData.amountTON ? (parseFloat(formData.amountTON) * rate).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          {enabled || address ? (
            <>
              <p className="text-xs opacity-70 mt-1">Available: {balance.toFixed(2)} TON</p>
              <p className="text-xs opacity-60">Rate: 1 TON = ₦{rate.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-xs opacity-60 mt-1">Connect wallet to see available balance</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full tp-btn tp-button-primary"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
