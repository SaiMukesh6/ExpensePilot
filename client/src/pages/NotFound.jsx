import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
      <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/25">
          <FaExclamationTriangle className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight">404</h1>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Page Not Found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The link you are trying to access doesn't exist or has been moved to another navigation.
          </p>
        </div>
        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md active:scale-98 cursor-pointer"
        >
          <FaHome className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
