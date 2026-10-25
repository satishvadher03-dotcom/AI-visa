import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Globe, Lock, Mail, ArrowRight, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import apiRequest from '../../services/api.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success && res.user) {
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.user.role === 'CONSULTANT') {
        navigate('/consultant/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } else {
      setError(res.error || 'Invalid credentials or connection error.');
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: forgotEmail }),
    });
    setForgotMsg(res.message || 'Password reset link dispatched.');
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              AuraVisa<span className="text-blue-600">.</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your secure applicant portal, case files, and documents
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Section */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            One-Click Demo Profiles for Verification
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => fillCredentials('customer@auravisa.com', 'Customer123!')}
              className="py-1.5 px-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold transition cursor-pointer text-center"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('consultant@auravisa.com', 'Consultant123!')}
              className="py-1.5 px-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-semibold transition cursor-pointer text-center"
            >
              Consultant
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@auravisa.com', 'AdminPassword123!')}
              className="py-1.5 px-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg font-semibold transition cursor-pointer text-center"
            >
              Administrator
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an applicant profile?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Account Recovery</h3>
            </div>
            {forgotMsg ? (
              <div className="text-xs text-slate-600 space-y-3">
                <p className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
                  {forgotMsg}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(false);
                    setForgotMsg(null);
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-xl font-semibold text-xs"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Dispatch Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
