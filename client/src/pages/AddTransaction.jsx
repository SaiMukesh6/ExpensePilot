import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TransactionForm from '../components/TransactionForm';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const toastId = toast.loading('Saving transaction...');
    try {
      const res = await api.post('/transactions', formData);
      if (res.data && res.data.success) {
        toast.success('Transaction recorded successfully!', { id: toastId });
        navigate('/transactions');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight text-center">
            Add Transaction
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Record a new cash flow record in your wallet.
          </p>
        </div>
        <TransactionForm onSubmit={handleSubmit} submitLoading={loading} />
      </div>
    </div>
  );
};

export default AddTransaction;
