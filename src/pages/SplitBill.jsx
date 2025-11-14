import { useState, useEffect } from 'react';
import axios from 'axios';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { validateAddress } from '../services/ton';
import { useAuth } from '../context/AuthContext';
import { isValidTONAddress } from '../utils/validators';

export default function SplitBill() {
  const address = useTonAddress();
  const { user } = useAuth();
  const mockAddress = () => 'EQA'.padEnd(48, 'A');
  const [formData, setFormData] = useState({
    description: '',
    totalAmount: 0,
    recipient: (user && user.address) || '',
    members: [{ address: '', ratio: 1, share: 0 }]
  });
  const [rate, setRate] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    console.log('SplitBill component mounted');
    fetchRate();
    fetchBills();
  }, []);

  const fetchRate = async () => {
    try {
      const res = await axios.get('/api/rate');
      setRate(res.data.rate);
    } catch (error) {
      console.error('Rate fetch error:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const res = await axios.get('/api/bills');
      setBills(res.data);
    } catch (error) {
      console.error('Bills fetch error:', error);
    }
  };

  const addParticipant = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { address: '', ratio: 1, share: 0 }]
    });
  };

  const removeParticipant = (index) => {
    setFormData({
      ...formData,
      members: formData.members.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate recipient address
    if (!formData.recipient || !isValidTONAddress(formData.recipient)) {
      alert('Please enter a valid TON address (should start with EQ, UQ, or kQ and be 48+ characters)');
      setLoading(false);
      return;
    }
    
    // Filter out empty member addresses and validate them
    const validMembers = formData.members.filter(m => m.address && isValidTONAddress(m.address));
    
    if (validMembers.length === 0) {
      alert('Please add at least one participant with a valid TON address');
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post('/api/split-bill', {
        hostAddress: address || mockAddress(),
        totalAmount: parseFloat(formData.totalAmount),
        splitType: 'ton', // Must be lowercase to match model enum
        participants: validMembers,
        rate
      });
      
      if (res.data.success) {
        setResult(res.data);
        alert('✅ Split bill created! Share the link with participants.');
      } else {
        alert('Failed to create split bill: ' + (res.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('API error:', error);
      alert('Failed to create split bill: ' + (error.response?.data?.error || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const splitEqually = () => {
    const memberCount = formData.members.length;
    if (memberCount === 0 || formData.totalAmount <= 0) return;
    
    const equalShare = parseFloat((formData.totalAmount / memberCount).toFixed(2));
    
    setFormData({
      ...formData,
      members: formData.members.map(member => ({
        ...member,
        share: equalShare
      }))
    });
  };

  const splitByPercentage = () => {
    const memberCount = formData.members.length;
    if (memberCount === 0 || formData.totalAmount <= 0) return;
    
    const percentagePerMember = 100 / memberCount;
    
    setFormData({
      ...formData,
      members: formData.members.map(member => ({
        ...member,
        share: parseFloat((formData.totalAmount * percentagePerMember / 100).toFixed(2))
      }))
    });
  };

  const splitByRatios = () => {
    const totalRatios = formData.members.reduce((acc, member) => acc + member.ratio, 0);
    if (totalRatios === 0) return;
    
    setFormData({
      ...formData,
      members: formData.members.map(member => ({
        ...member,
        share: parseFloat((formData.totalAmount * member.ratio / totalRatios).toFixed(2))
      }))
    });
  };

  const handleParticipantChange = (index, field, value) => {
    const updatedMembers = [...formData.members];
    
    if (field === 'ratio') {
      updatedMembers[index] = {
        ...updatedMembers[index],
        ratio: value ? parseInt(value) : 1
      };
    } else {
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: value
      };
    }
    
    setFormData({
      ...formData,
      members: updatedMembers
    });
  };

  const totalPeople = formData.members.length + 1;
  const perPerson = formData.totalAmount ? (parseFloat(formData.totalAmount) / totalPeople) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-3 px-3 py-3 safe-area-padding app-gradient min-h-screen">
      <h2 className="text-xl font-bold">Split Bill</h2>

      <div className="tp-card p-3">
        <div className="mb-2">
          <TonConnectButton />
        </div>
        {address && (
          <p className="text-xs opacity-70">Connected: {address.slice(0, 10)}...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="tp-card p-3 space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1">Total Amount (TON)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            className="tp-input w-full text-sm py-2"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Split Type</label>
          <select
            value="ton"
            onChange={(e) => setFormData({ ...formData, splitType: 'ton' })}
            className="tp-input w-full text-sm py-2"
          >
            <option value="ton">Credit in TON</option>
          </select>
        </div>

        <div className="tp-form-group">
          <label className="text-xs font-medium mb-1 block">Recipient TON Address</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="EQ..."
              required
              className="tp-input flex-1 text-sm py-2"
            />
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, recipient: user.address })}
              className="tp-btn tp-button-secondary text-xs px-2 py-2 whitespace-nowrap"
            >
              Use Mine
            </button>
          </div>
          {formData.recipient && (
            <div className="mt-1 text-xs flex items-center">
              <span className={`px-1.5 py-0.5 rounded mr-1 text-xs ${isValidTONAddress(formData.recipient) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isValidTONAddress(formData.recipient) ? '✓ Valid' : '⚠ Invalid'}
              </span>
              <span className="font-mono text-xs">
                {formData.recipient.slice(0, 6)}...{formData.recipient.slice(-4)}
              </span>
            </div>
          )}
        </div>

        <div>
          <div className="flex gap-1.5 mb-2">
            <button 
              onClick={splitEqually}
              className="tp-btn tp-button-secondary text-xs flex-1 px-2 py-1.5"
            >
              Split Equally
            </button>
            <button 
              onClick={splitByPercentage}
              className="tp-btn tp-button-secondary text-xs flex-1 px-2 py-1.5"
            >
              By %
            </button>
            <button 
              onClick={splitByRatios}
              className="tp-btn tp-button-secondary text-xs flex-1 px-2 py-1.5"
            >
              By Ratio
            </button>
          </div>
          <div className="space-y-1.5 mb-2">
            {formData.members.map((p, i) => (
              <div key={i} className="p-2 tp-card bg-gray-50 rounded-lg">
                <div className="flex gap-1.5 items-center mb-1.5">
                  <input
                    type="text"
                    placeholder="TON Address (EQ...)"
                    value={p.address}
                    onChange={(e) => handleParticipantChange(i, 'address', e.target.value)}
                    className="tp-input flex-1 text-xs py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => removeParticipant(i)}
                    className="tp-btn bg-red-500 text-white px-2 py-1.5 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex-1">
                    <label className="text-xs opacity-70 mb-0.5 block">Ratio</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={p.ratio || 1}
                      onChange={(e) => handleParticipantChange(i, 'ratio', e.target.value)}
                      min="1"
                      className="tp-input w-full text-xs py-1.5"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs opacity-70 mb-0.5 block">Share (TON)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={p.share || 0}
                      onChange={(e) => handleParticipantChange(i, 'share', e.target.value)}
                      className="tp-input w-full text-xs py-1.5"
                    />
                  </div>
                </div>
                {p.address && !isValidTONAddress(p.address) && (
                  <p className="text-xs text-red-600 mt-0.5">⚠ Invalid</p>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addParticipant}
            className="w-full py-1.5 border-2 border-dashed rounded-lg text-gray-600 text-sm"
          >
            + Add Participant
          </button>
        </div>

        {formData.totalAmount && totalPeople > 0 && (
          <div className="p-2.5 tp-card tone-split">
            <p className="text-xs text-gray-600">Per Person:</p>
            <p className="text-lg font-bold">
              {perPerson.toFixed(2)} TON
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || formData.members.length === 0 || !formData.recipient}
          className="w-full tp-btn tp-button-primary disabled:opacity-50 text-sm py-2"
        >
          {loading ? 'Creating...' : 'Create Split Bill'}
        </button>
      </form>

      {result && result.success && (
        <div className="tp-card p-3 tone-airtime">
          <h3 className="font-bold mb-1.5 text-sm">✅ Split Bill Created!</h3>
          <p className="text-xs mb-1.5">Split ID: {result.splitId}</p>
          {result.perPerson && (
            <p className="text-xs mb-1.5">Per Person: {result.perPerson.ton.toFixed(4)} TON (₦{result.perPerson.ngn.toFixed(2)})</p>
          )}
          {result.joinUrl && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold mb-1.5">📤 Share this link:</p>
              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  value={result.joinUrl} 
                  readOnly 
                  className="tp-input flex-1 text-xs py-1.5"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.joinUrl);
                    alert('Link copied to clipboard!');
                  }}
                  className="tp-btn tp-button-primary text-xs px-2 py-1.5 whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {bills.length > 0 && (
        <div className="space-y-2">
          {bills.map(bill => (
            <div key={bill._id} className="tp-card mb-2 p-2">
              <BillDetail bill={bill} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
