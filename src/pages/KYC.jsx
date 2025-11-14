import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function KYC() {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    documentType: 'national_id',
    documentNumber: ''
  });

  useEffect(() => {
    if (user) {
      // Pre-fill form with user data
      setFormData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        dateOfBirth: '',
        documentType: 'national_id',
        documentNumber: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate KYC verification (demo mode)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing

      const res = await axios.post('/api/kyc/verify', formData);
      
      if (res.data.success) {
        toast.success('🎉 KYC verification submitted! (Demo mode - auto-approved)');
        if (fetchUser) await fetchUser();
        setTimeout(() => navigate('/settings'), 2000);
      } else {
        toast.error(res.data.error || 'KYC submission failed');
      }
    } catch (error) {
      console.error('KYC submit error:', error);
      toast.error('Failed to submit KYC: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-4 safe-area-padding app-gradient min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/settings')}
          className="tp-btn tp-button-muted text-sm px-3 py-2"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold">KYC Verification</h2>
      </div>

      <div className="tp-card p-4 space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-800 mb-2">📋 Why Verify?</p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Increase your transfer limit to ₦50,000+</li>
            <li>Access all premium features</li>
            <li>Enhanced security for your account</li>
            <li>Faster transaction processing</li>
          </ul>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            🧪 <strong>Demo Mode:</strong> This is a simplified KYC form for demonstration. In production, this would use Sumsub for identity verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="tp-input w-full"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="tp-input w-full"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date of Birth</label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="tp-input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              className="tp-input w-full"
            >
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Document Number</label>
            <input
              type="text"
              required
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              className="tp-input w-full"
              placeholder="Enter document number"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">💡 Demo Note:</p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>In production, you would upload document photos</li>
              <li>Face verification would be required</li>
              <li>Verification would take 1-24 hours</li>
              <li>For demo, this is auto-approved instantly</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full tp-btn tp-button-primary disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
