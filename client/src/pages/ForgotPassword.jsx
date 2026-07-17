import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaEnvelope, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending reset email...');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Email sent successfully!', { id: toastId });
        setSubmitted(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-4 sm:px-6 transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-6 transition-colors duration-300">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-emerald-500 tracking-tight">ExpensePilot</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Password Recovery Portal</p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-sm font-semibold">
              If your email is registered in our database, we have sent a secure link to reset your password. 
              Please check your inbox (or backend server logs for the mock printout).
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md"
            >
              <FaArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your registered email address below. If the email exists in our records, we will send you a temporary link to reset your credentials securely.
            </p>

            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaEnvelope className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 caret-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer mt-6"
            >
              <FaPaperPlane className="w-3.5 h-3.5" />
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </button>

            {/* Back button */}
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <FaArrowLeft className="w-3 h-3" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
