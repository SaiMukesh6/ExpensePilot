import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaCalendarAlt, FaTag } from 'react-icons/fa';

const TransactionTable = ({ transactions = [], onDelete }) => {
  const formatCurrency = (amount, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
    return type === 'Income' ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          No transactions found.
        </p>
        <Link
          to="/add-transaction"
          className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          Add First Transaction
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left">
        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200">
          {transactions.map((t) => (
            <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
              {/* Title & Notes */}
              <td className="px-6 py-4">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
                  {t.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 max-w-[200px] truncate">{t.notes}</p>}
                </div>
              </td>
              {/* Amount */}
              <td className={`px-6 py-4 font-bold ${t.type === 'Income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {formatCurrency(t.amount, t.type)}
              </td>
              {/* Category */}
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaTag className="w-3 h-3 text-slate-400" />
                  {t.category}
                </span>
              </td>
              {/* Date */}
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(t.date)}
                </span>
              </td>
              {/* Type Badge */}
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  t.type === 'Income'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}>
                  {t.type}
                </span>
              </td>
              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2.5">
                  <Link
                    to={`/edit-transaction/${t._id}`}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    title="Edit Transaction"
                  >
                    <FaEdit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(t._id)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none"
                    title="Delete Transaction"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
