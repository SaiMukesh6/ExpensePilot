import { NavLink } from 'react-router-dom';
import { FaChartPie, FaExchangeAlt, FaUser, FaPlusCircle, FaTimes } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const links = [
    { to: '/', name: 'Dashboard', icon: <FaChartPie className="w-5 h-5" /> },
    { to: '/transactions', name: 'Transactions', icon: <FaExchangeAlt className="w-5 h-5" /> },
    { to: '/add-transaction', name: 'Add Transaction', icon: <FaPlusCircle className="w-5 h-5" /> },
    { to: '/profile', name: 'My Profile', icon: <FaUser className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] lg:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header (Mobile Close Option) */}
            <div className="flex items-center justify-between h-16 px-6 lg:hidden border-b border-slate-200 dark:border-slate-800">
              <span className="text-xl font-bold text-emerald-500">Navigation</span>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu */}
            <nav className="p-4 space-y-2 mt-4">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => {
                    // Auto-close on mobile after link selection
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all group duration-200 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white text-slate-500 dark:text-slate-400'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Footer inside sidebar */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
            <p className="font-semibold text-slate-600 dark:text-slate-400 font-mono">ExpensePilot</p>
            <p className="mt-1">v1.0.0 Stable</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
