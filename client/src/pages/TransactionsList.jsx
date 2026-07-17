import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TransactionTable from '../components/TransactionTable';
import { FaSearch, FaFilter, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dropdown list category lists
  const allCategories = [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Gifts',
    'Rent/Housing',
    'Groceries/Food',
    'Utilities',
    'Entertainment',
    'Travel/Transport',
    'Healthcare',
    'Shopping',
    'Others'
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Construct URL parameters
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (type) params.type = type;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions', { params });
      if (res.data && res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Run search when filters trigger
  useEffect(() => {
    // Basic debounce for search title input
    const delayDebounce = setTimeout(() => {
      fetchTransactions();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, category, type, startDate, endDate]);

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

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setType('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">
            Transactions History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, search, and filter your record history.
          </p>
        </div>
        <Link
          to="/add-transaction"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md cursor-pointer hover:scale-[1.02]"
        >
          <FaPlus /> Add New Record
        </Link>
      </div>

      {/* Filter panel */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 transition-colors">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <FaFilter className="w-4 h-4 text-slate-400" />
          <span>Filter Records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search title */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FaSearch className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 caret-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Types</option>
            <option value="Income" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Income</option>
            <option value="Expense" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Expense</option>
          </select>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{cat}</option>
            ))}
          </select>

          {/* Start Date */}
          <div className="flex flex-col">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              title="Start Date"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white caret-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              title="End Date"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white caret-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Reset Filters Option */}
        {(search || category || type || startDate || endDate) && (
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors focus:outline-none cursor-pointer"
            >
              <FaTimes className="w-3 h-3" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <TransactionTable transactions={transactions} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default TransactionsList;
