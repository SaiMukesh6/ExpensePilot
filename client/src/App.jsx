import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TransactionsList from './pages/TransactionsList';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { FaSpinner } from 'react-icons/fa';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, darkMode, setDarkMode }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <FaSpinner className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Header */}
      <Navbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="flex flex-1 relative">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950/20">
          <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          {/* Bottom Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // default to dark mode
  });

  // Sync dark mode HTML element class and body background styles
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0b0f19'; // Keep viewport viewport body sync
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Secure Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute darkMode={darkMode} setDarkMode={setDarkMode}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute darkMode={darkMode} setDarkMode={setDarkMode}>
                <TransactionsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-transaction"
            element={
              <ProtectedRoute darkMode={darkMode} setDarkMode={setDarkMode}>
                <AddTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-transaction/:id"
            element={
              <ProtectedRoute darkMode={darkMode} setDarkMode={setDarkMode}>
                <EditTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute darkMode={darkMode} setDarkMode={setDarkMode}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 & Capture Fallback */}
          <Route
            path="/404"
            element={
              <ProtectedRoute darkMode={darkMode} setDarkMode={setDarkMode}>
                <NotFound />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>

      {/* Global alert toast notification config */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 text-sm font-semibold rounded-xl px-4 py-3.5',
          duration: 3500
        }}
      />
    </AuthProvider>
  );
}

export default App;
