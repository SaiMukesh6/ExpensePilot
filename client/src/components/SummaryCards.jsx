import { FaWallet, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const SummaryCards = ({ balance = 0, income = 0, expense = 0 }) => {
  const cards = [
    {
      title: 'Current Balance',
      amount: balance,
      icon: <FaWallet className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/5 border-indigo-500/20 dark:border-indigo-500/10',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Total Income',
      amount: income,
      icon: <FaArrowUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Total Expenses',
      amount: expense,
      icon: <FaArrowDown className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
      bg: 'bg-rose-500/10 dark:bg-rose-500/5 border-rose-500/20 dark:border-rose-500/10',
      textColor: 'text-rose-600 dark:text-rose-400'
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`flex items-center justify-between p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs transition-transform duration-200 hover:-translate-y-0.5 ${card.bg}`}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {card.title}
            </p>
            <p className={`text-3xl font-extrabold tracking-tight ${card.textColor}`}>
              {formatCurrency(card.amount)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 shadow-sm border border-slate-200/50 dark:border-slate-800">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
