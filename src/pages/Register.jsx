import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        referralCode: formData.referralCode || undefined
      });

      if (res.data.success) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        login(res.data.user);
        // Prompt for KYC after registration
        toast.success('Account created! Complete KYC to transfer above ₦50,000');
        setTimeout(() => {
          navigate('/settings?tab=kyc');
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-gradient px-4 py-8 safe-area-padding">
      <div className="w-full max-w-md">
        <div className="tp-card p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-sm opacity-70">Join TONPay Africa today</p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="tp-input w-full"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="tp-input w-full"
                placeholder="08012345678"
              />
              <p className="text-xs opacity-60 mt-1">Email or phone is required</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="tp-input w-full"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="tp-input w-full"
                placeholder="Re-enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Referral Code (Optional)</label>
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                className="tp-input w-full"
                placeholder="TPXXXXXX"
              />
            </div>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm opacity-70">
                I agree to the{' '}
                <a href="#" className="text-blue-500 hover:underline">Terms & Conditions</a>
                {' '}and{' '}
                <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full tp-btn tp-button-primary disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="opacity-70">Already have an account? </span>
            <Link to="/login" className="text-blue-500 hover:underline font-semibold">
              Login
            </Link>
          </div>
        </div>

        <div className="mt-6 tp-card p-4">
          <p className="text-xs opacity-70 text-center">
            🔒 Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
