import { useState, useEffect } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import axios from 'axios';
import { addHistory } from '../services/history';
import { useDemoWallet } from '../context/DemoWalletContext';
import { getBalance } from '../services/ton';
import toast from 'react-hot-toast';
import SuccessScreen from '../components/SuccessScreen';

export default function Data() {
  const address = useTonAddress();
  const { demoBalance, spend, enabled } = useDemoWallet();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone: '',
    network: '',
    planId: ''
  });
  const [rate, setRate] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const mockAddress = () => 'EQA'.padEnd(48, 'A');

  const plansByNetwork = {
    MTN: [
      { id: 'mtn-1gb-1d', label: '1GB - 1 day', priceNGN: 350 },
      { id: 'mtn-1.5gb-30d', label: '1.5GB - 30 days', priceNGN: 1000 },
      { id: 'mtn-3gb-30d', label: '3GB - 30 days', priceNGN: 1500 },
      { id: 'mtn-6gb-30d', label: '6GB - 30 days', priceNGN: 3000 }
    ],
    Airtel: [
      { id: 'airtel-1gb-1d', label: '1GB - 1 day', priceNGN: 350 },
      { id: 'airtel-2gb-7d', label: '2GB - 7 days', priceNGN: 1200 },
      { id: 'airtel-6gb-30d', label: '6GB - 30 days', priceNGN: 3000 }
    ],
    Glo: [
      { id: 'glo-1gb-1d', label: '1GB - 1 day', priceNGN: 300 },
      { id: 'glo-2.9gb-14d', label: '2.9GB - 14 days', priceNGN: 1000 },
      { id: 'glo-7gb-30d', label: '7GB - 30 days', priceNGN: 2500 }
    ],
    '9mobile': [
      { id: '9m-1gb-1d', label: '1GB - 1 day', priceNGN: 350 },
      { id: '9m-1.5gb-30d', label: '1.5GB - 30 days', priceNGN: 1200 },
      { id: '9m-4.5gb-30d', label: '4.5GB - 30 days', priceNGN: 2000 }
    ]
  };

  const selectedPlan = formData.network
    ? plansByNetwork[formData.network]?.find(p => p.id === formData.planId)
    : null;

  const planTonCost = selectedPlan ? (selectedPlan.priceNGN / rate) : 0;

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
        const res = await getBalance(address);
        setBalance(res?.balance || 0);
      } catch {
        setBalance(0);
      }
    } else {
      setBalance(0);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.network) {
      toast.error('Please select a network');
      return;
    }
    if (!formData.planId) {
      toast.error('Please select a data plan');
      return;
    }
    if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      toast.error('Enter a valid phone number');
      return;
    }
    if (planTonCost > balance) {
      toast.error('Insufficient balance');
      return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Processing data purchase...');
    try {
      const walletAddr = address || mockAddress();
      const amountNGN = selectedPlan.priceNGN;
      const amountTON = planTonCost;
      if (enabled) {
        if (!spend(amountTON)) {
          toast.dismiss(loadingToast);
          toast.error('Insufficient balance');
          setLoading(false);
          return;
        }
      }
      await new Promise(r => setTimeout(r, 1500));
      addHistory({
        section: 'data',
        title: `${formData.network} Data`,
        amountTON: amountTON,
        amountNGN: amountNGN,
        note: formData.phone,
        meta: { phone: formData.phone, network: formData.network, planId: formData.planId, walletAddress: walletAddr }
      });
      toast.dismiss(loadingToast);
      toast.success('Data purchased successfully!');
      setLoading(false);
      setTimeout(() => {
        setStep(3);
      }, 200);
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error('Failed to process data purchase: ' + (e.message || 'Unknown error'));
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <SuccessScreen
        icon="📶"
        title="Data Purchased!"
        message={`${selectedPlan?.label || 'Data bundle'} has been sent to ${formData.phone}`}
        amountTON={planTonCost}
        amountNGN={selectedPlan?.priceNGN || 0}
        details={{
          'Network': formData.network,
          'Phone Number': formData.phone,
          'Plan': selectedPlan?.label || 'N/A',
        }}
        primaryAction={() => window.location.href = '/'}
        primaryLabel="Go to Dashboard"
        secondaryAction={() => setStep(1)}
        secondaryLabel="Buy More"
      />
    );
  }

  if (step === 2) {
    const amountNGN = selectedPlan?.priceNGN || 0;
    const fee = amountNGN * 0.01;
    const finalNGN = amountNGN + fee;

    return (
      <>
        <div className="bottom-sheet-backdrop" onClick={() => setStep(1)} />
        <div className="bottom-sheet open safe-area-bottom">
          <div className="handle" />
          <div className="px-4 pb-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 gap-3">
              <h2 className="text-xl font-bold">Confirm Data Purchase</h2>
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
                <span className="text-sm opacity-70">Plan</span>
                <span className="font-semibold">{selectedPlan?.label}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-sm opacity-70">Amount (TON)</span>
                <span className="font-semibold">{planTonCost.toFixed(4)} TON</span>
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
      <h2 className="text-2xl font-bold">Buy Data</h2>

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
            onChange={(e) => {
              setFormData({ phone: formData.phone, network: e.target.value, planId: '' });
            }}
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
          <label className="block text-sm font-medium mb-2">Plan</label>
          <select
            required
            value={formData.planId}
            onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
            className="tp-input w-full"
            disabled={!formData.network}
          >
            <option value="">Select Plan</option>
            {formData.network && plansByNetwork[formData.network]?.map(p => (
              <option key={p.id} value={p.id}>{p.label} • ₦{p.priceNGN.toLocaleString()}</option>
            ))}
          </select>
        </div>

        {selectedPlan && (
          <div className="p-4 tp-card tone-airtime">
            <p className="text-sm text-gray-600">You will pay</p>
            <p className="text-xl font-bold">{planTonCost.toFixed(4)} TON</p>
            <p className="text-xs text-gray-500">≈ ₦{selectedPlan.priceNGN.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Available: {balance.toFixed(2)} TON • Rate: 1 TON = ₦{rate.toLocaleString()}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full tp-btn tp-button-primary"
          disabled={!selectedPlan}
        >
          Continue
        </button>
      </form>
    </div>
  );
}
