import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { validateAddress } from '../services/ton';
import { useAuth } from '../context/AuthContext';
import { isValidTONAddress } from '../utils/validators';

export default function SplitBill() {
  const navigate = useNavigate();
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
  
  // Ensure bills and rate are always valid
  const safeBills = Array.isArray(bills) ? bills : [];
  const safeRate = typeof rate === 'number' && !isNaN(rate) && rate > 0 ? rate : 2000;

  useEffect(() => {
    console.log('SplitBill component mounted');
    fetchRate();
    fetchBills();
  }, []);

  const fetchRate = async () => {
    try {
      const res = await axios.get('/api/rate');
      setRate(res.data?.rate || 2000);
    } catch (error) {
      console.error('Rate fetch error:', error);
      setRate(2000);
    }
  };

  const fetchBills = async () => {
    try {
      const res = await axios.get('/api/bills');
      // Ensure we always set an array
      setBills(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Bills fetch error:', error);
      setBills([]);
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
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
      <div className="max-w-2xl mx-auto space-y-2 px-2 py-2 pb-32 app-gradient">
        <h2 className="text-lg font-bold">Split Bill</h2>

      <div className="tp-card p-2">
        <div className="mb-1 scale-90 origin-left">
          <TonConnectButton />
        </div>
        {address && (
          <p className="text-xs opacity-70">Connected: {address.slice(0, 10)}...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="tp-card p-2 space-y-2">
        <div>
          <label className="block text-xs font-medium mb-0.5">Description</label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="tp-input w-full text-xs py-1"
            placeholder="e.g., Dinner"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-0.5">Total Amount (TON)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={formData.totalAmount}
            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
            className="tp-input w-full text-xs py-1"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-0.5">Split Type</label>
          <select
            value="ton"
            onChange={(e) => setFormData({ ...formData, splitType: 'ton' })}
            className="tp-input w-full text-xs py-1"
          >
            <option value="ton">Credit in TON</option>
          </select>
        </div>

        <div className="tp-form-group">
          <label className="text-xs font-medium mb-0.5 block">Recipient Address</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              placeholder="EQ..."
              required
              className="tp-input flex-1 text-xs py-1"
            />
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, recipient: user.address })}
              className="tp-btn tp-button-secondary text-xs px-2 py-1 whitespace-nowrap"
            >
              Mine
            </button>
          </div>
          {formData.recipient && (
            <div className="mt-0.5 text-xs flex items-center">
              <span className={`px-1 py-0.5 rounded mr-1 text-xs ${isValidTONAddress(formData.recipient) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isValidTONAddress(formData.recipient) ? '✓' : '⚠'}
              </span>
              <span className="font-mono text-xs">
                {formData.recipient.slice(0, 6)}...{formData.recipient.slice(-4)}
              </span>
            </div>
          )}
        </div>

        <div>
          <div className="flex gap-1 mb-1">
            <button 
              type="button"
              onClick={splitEqually}
              className="tp-btn tp-button-secondary text-xs flex-1 px-1 py-1"
            >
              Equal
            </button>
            <button 
              type="button"
              onClick={splitByPercentage}
              className="tp-btn tp-button-secondary text-xs flex-1 px-1 py-1"
            >
              By %
            </button>
            <button 
              type="button"
              onClick={splitByRatios}
              className="tp-btn tp-button-secondary text-xs flex-1 px-1 py-1"
            >
              Ratio
            </button>
          </div>
          <div className="space-y-1 mb-1">
            {formData.members.map((p, i) => (
              <div key={i} className="p-1.5 tp-card bg-gray-50 rounded">
                <div className="flex gap-1 items-center mb-1">
                  <input
                    type="text"
                    placeholder="TON Address"
                    value={p.address}
                    onChange={(e) => handleParticipantChange(i, 'address', e.target.value)}
                    className="tp-input flex-1 text-xs py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => removeParticipant(i)}
                    className="tp-btn bg-red-500 text-white px-1.5 py-0.5 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Ratio"
                      value={p.ratio || 1}
                      onChange={(e) => handleParticipantChange(i, 'ratio', e.target.value)}
                      min="1"
                      className="tp-input w-full text-xs py-0.5"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Share"
                      value={p.share || 0}
                      onChange={(e) => handleParticipantChange(i, 'share', e.target.value)}
                      className="tp-input w-full text-xs py-0.5"
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
            className="w-full py-1 border-2 border-dashed rounded text-gray-600 text-xs"
          >
            + Add
          </button>
        </div>

        {formData.totalAmount && totalPeople > 0 && (
          <div className="p-1.5 tp-card tone-split">
            <p className="text-xs text-gray-600">Per Person:</p>
            <p className="text-base font-bold">
              {(perPerson || 0).toFixed(2)} TON
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || formData.members.length === 0 || !formData.recipient}
          className="w-full tp-btn tp-button-primary disabled:opacity-50 text-sm py-2 sticky bottom-0 shadow-lg"
        >
          {loading ? 'Creating...' : 'Create Split Bill'}
        </button>
      </form>

      {result && result.success && (
        <div className="tp-card p-3 tone-airtime">
          <h3 className="font-bold mb-1.5 text-sm">✅ Split Bill Created!</h3>
          <p className="text-xs mb-1.5">Split ID: {result.splitId}</p>
          {result.perPerson && (
            <p className="text-xs mb-1.5">Per Person: {(result.perPerson.ton || 0).toFixed(4)} TON (₦{(result.perPerson.ngn || 0).toFixed(2)})</p>
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
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold mt-4">Your Active Split Bills</h3>
          {safeBills.map(bill => (
            <div key={bill._id} className="tp-card mb-2 p-3">
              <BillDetail bill={bill} user={user} navigate={navigate} />
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

// BillDetail Component
function BillDetail({ bill, user, navigate }) {
  const safeRate = 2000; // Default rate
  const isHost = user?.walletAddress === bill.hostAddress;
  const isParticipant = bill.participants?.some(p => p.address === user?.walletAddress);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm">{bill.description || 'Split Bill'}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          bill.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {bill.status}
        </span>
      </div>
      <div className="text-xs opacity-80 space-y-1">
        <p>Total: {(bill.totalAmount || 0).toFixed(2)} TON (≈ ₦{((bill.totalAmount || 0) * safeRate).toLocaleString('en-NG')})</p>
        <p>Host: {bill.hostAddress?.slice(0, 6)}...{bill.hostAddress?.slice(-4)}</p>
        <p>Participants: {bill.participants?.length || 0}</p>
        <p>Created: {new Date(bill.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div className="flex gap-2 mt-2">
        {isHost && bill.status === 'active' && (
          <button 
            onClick={() => navigate(`/split-bill/${bill._id}/manage`)}
            className="tp-btn tp-button-primary text-xs px-3 py-1"
          >
            Manage
          </button>
        )}
        {!isHost && isParticipant && bill.status === 'active' && (
          <button 
            onClick={() => navigate(`/split-bill/${bill._id}/join`)}
            className="tp-btn tp-button-primary text-xs px-3 py-1"
          >
            View/Pay
          </button>
        )}
        <button 
          onClick={() => navigate(`/split-bill/${bill._id}`)}
          className="tp-btn tp-button-secondary text-xs px-3 py-1"
        >
          Details
        </button>
      </div>
    </div>
  );
}
