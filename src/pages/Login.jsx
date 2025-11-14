import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-gradient px-4 py-8 safe-area-padding">
      <div className="w-full max-w-md">
        <div className="tp-card p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">TONPay Africa</h1>
            <p className="text-sm opacity-70">Welcome back! Please login to continue</p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email or Phone</label>
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="tp-input w-full"
                placeholder="Enter email or phone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="tp-input w-full"
                placeholder="Enter password"
              />
            </div>

            <div className="flex justify-end">
              <Link to="/reset-password" className="text-sm text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full tp-btn tp-button-primary disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="opacity-70">Don't have an account? </span>
            <Link to="/register" className="text-blue-500 hover:underline font-semibold">
              Sign up
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
