import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import SummaryCards from '../components/SummaryCards';
import TransactionTable from '../components/TransactionTable';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FaPlus, FaRegCalendarAlt, FaChartBar, FaChartPie, FaSpinner } from 'react-icons/fa';

const COLORS = ['#10b981', '#6366f1', '#f43f5e', '#eab308', '#06b6d4', '#d946ef', '#f97316', '#a855f7'];

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      if (res.data && res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const res = await api.delete(`/transactions/${id}`);
      if (res.data && res.data.success) {
        toast.success('Transaction deleted');
        setTransactions(transactions.filter((t) => t._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  // Calculations for Summary Cards
  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Process data for Monthly Analytics Chart (Income vs Expense)
  const getMonthlyData = () => {
    const monthlyMap = {};

    // Process from oldest to newest to keep chronological order
    [...transactions].reverse().forEach((t) => {
      const date = new Date(t.date);
      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g. "Jan 26"
      
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, Income: 0, Expense: 0 };
      }
      
      if (t.type === 'Income') {
        monthlyMap[key].Income += t.amount;
      } else {
        monthlyMap[key].Expense += t.amount;
      }
    });

    return Object.values(monthlyMap);
  };

  // Process data for Category Breakdown Pie Chart
  const getCategoryData = () => {
    const categoryMap = {};

    transactions
      .filter((t) => t.type === 'Expense')
      .forEach((t) => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
      });

    return Object.keys(categoryMap).map((cat) => ({
      name: cat,
      value: parseFloat(categoryMap[cat].toFixed(2))
    }));
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time insights of your cashflow and budget.
          </p>
        </div>
        <Link
          to="/add-transaction"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer hover:scale-[1.02]"
        >
          <FaPlus /> Record Transaction
        </Link>
      </div>

      {/* Summary Stats grid */}
      <SummaryCards balance={balance} income={totalIncome} expense={totalExpense} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Income vs Expense */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <FaChartBar className="text-slate-400 w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Monthly Cashflow</h3>
          </div>
          <div className="h-72">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No monthly data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart: Expenses by Category */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <FaChartPie className="text-slate-400 w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Expenses by Category</h3>
          </div>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-center">
            {categoryData.length > 0 ? (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#f8fafc',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="w-full sm:w-1/2 max-h-56 overflow-y-auto space-y-2 px-4">
                  {categoryData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">${item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No expense data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaRegCalendarAlt className="text-slate-400 w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Recent Transactions</h3>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-bold text-emerald-500 hover:text-emerald-600 hover:underline"
          >
            View All Transactions
          </Link>
        </div>

        <TransactionTable transactions={recentTransactions} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Dashboard;
