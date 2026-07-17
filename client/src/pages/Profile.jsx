import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaCalendarAlt, FaPiggyBank, FaExchangeAlt, FaSpinner } from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCount: 0,
    incomeCount: 0,
    expenseCount: 0,
    totalSavings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/transactions');
        if (res.data && res.data.success) {
          const txs = res.data.data;
          
          const income = txs.filter(t => t.type === 'Income');
          const expense = txs.filter(t => t.type === 'Expense');
          
          const sumIncome = income.reduce((sum, t) => sum + t.amount, 0);
          const sumExpense = expense.reduce((sum, t) => sum + t.amount, 0);
          
          setStats({
            totalCount: txs.length,
            incomeCount: income.length,
            expenseCount: expense.length,
            totalSavings: sumIncome - sumExpense
          });
        }
      } catch (err) {
        toast.error('Failed to load activity statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account credentials and see activity metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-white space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg">
            {user?.name ? user.name[0].toUpperCase() : <FaUser />}
          </div>
          <div>
            <h3 className="text-lg font-bold truncate max-w-[200px]">{user?.name}</h3>
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{user?.email}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold rounded-full uppercase tracking-wider">
            Premium Pilot
          </span>
        </div>

        {/* Credentials and Details */}
        <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 text-slate-800 dark:text-slate-200 transition-colors">
          <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-2">
            Account Specifications
          </h3>

          <div className="space-y-4 text-sm font-semibold">
            {/* Full Name */}
            <div className="flex items-center gap-3">
              <FaUser className="text-slate-400 w-4 h-4 flex-shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-slate-400 font-medium">Name:</span>
                <span>{user?.name}</span>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-slate-400 w-4 h-4 flex-shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-slate-400 font-medium">Email:</span>
                <span className="truncate max-w-[200px]">{user?.email}</span>
              </div>
            </div>

            {/* Registration Date */}
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-slate-400 w-4 h-4 flex-shrink-0" />
              <div className="flex-1 flex justify-between">
                <span className="text-slate-400 font-medium">Joined:</span>
                <span>{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Analytics Panel */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 transition-colors">
        <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-2">
          Activity Statistics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Operations</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <FaExchangeAlt className="text-emerald-500 w-4 h-4" />
              <p className="text-2xl font-bold dark:text-white">{stats.totalCount}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Income vs Expense Ratio</p>
            <p className="text-2xl font-bold dark:text-white mt-2">
              {stats.incomeCount} <span className="text-slate-500 text-xs font-normal">in</span> / {stats.expenseCount} <span className="text-slate-500 text-xs font-normal">out</span>
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Savings</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <FaPiggyBank className="text-indigo-500 w-4.5 h-4.5" />
              <p className={`text-2xl font-bold ${stats.totalSavings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ${stats.totalSavings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
