import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Lock, Mail, ArrowRight, ShieldCheck, Heart, Building2, User } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      // Route according to role or previous destination
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'donor') {
        navigate('/donor/dashboard');
      } else if (loggedUser.role === 'ngo') {
        navigate('/ngo/dashboard');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-warm-200 shadow-xl shadow-warm-200/50">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-brand-500/20">
              <Utensils className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign in to FoodBridge</h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your credentials to access your organization dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full pl-10 pr-4 py-3 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Password
                </label>
                <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-xs border border-warm-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 disabled:opacity-50 transition shadow-md shadow-brand-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-warm-100">
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center mb-3">
              ⚡ Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('grand.hotel@foodbridge.org', 'donor123')}
                className="p-2 text-left bg-warm-50 hover:bg-brand-50 border border-warm-200 rounded-xl transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 group-hover:text-brand-700">
                  <Building2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Hotel Donor</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">Grand Horizon</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('hope.foundation@foodbridge.org', 'ngo123')}
                className="p-2 text-left bg-warm-50 hover:bg-teal-50 border border-warm-200 rounded-xl transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 group-hover:text-teal-700">
                  <Heart className="w-3.5 h-3.5 text-teal-600" />
                  <span>Verified NGO</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">Hope Foundation</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('care.alliance@foodbridge.org', 'ngo123')}
                className="p-2 text-left bg-warm-50 hover:bg-amber-50 border border-warm-200 rounded-xl transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 group-hover:text-amber-700">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending NGO</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">Care Alliance</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@foodbridge.org', 'admin123')}
                className="p-2 text-left bg-warm-50 hover:bg-purple-50 border border-warm-200 rounded-xl transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 group-hover:text-purple-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-gray-400 block mt-0.5">Moderator Portal</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

