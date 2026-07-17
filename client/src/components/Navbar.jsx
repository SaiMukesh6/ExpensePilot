import { useAuth } from '../context/AuthContext';
import { FaSun, FaMoon, FaSignOutAlt, FaUser, FaBars } from 'react-icons/fa';

const Navbar = ({ toggleSidebar, darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none lg:hidden"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <span className="text-2xl font-black text-emerald-500 tracking-tight">
              ExpensePilot
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-105 transition-all focus:outline-none border border-slate-200 dark:border-slate-700"
              title="Toggle Theme"
            >
              {darkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
            </button>

            {/* Profile Info */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                {user?.name ? user.name[0].toUpperCase() : <FaUser />}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all focus:outline-none"
              title="Log Out"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
