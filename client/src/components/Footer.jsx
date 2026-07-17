const Footer = () => {
  return (
    <footer className="py-6 px-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors text-center text-xs text-slate-500 dark:text-slate-500 duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} ExpensePilot. All rights reserved.</p>
        <p className="font-medium text-slate-600 dark:text-slate-400">
          Designed for Software Engineering Placements
        </p>
      </div>
    </footer>
  );
};

export default Footer;
