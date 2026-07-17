import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import TransactionForm from '../components/TransactionForm';
import { FaSpinner } from 'react-icons/fa';

const EditTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await api.get(`/transactions/${id}`);
        if (res.data && res.data.success) {
          setTransaction(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load transaction details');
        navigate('/transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setSubmitLoading(true);
    const toastId = toast.loading('Updating record...');
    try {
      const res = await api.put(`/transactions/${id}`, formData);
      if (res.data && res.data.success) {
        toast.success('Transaction updated successfully!', { id: toastId });
        navigate('/transactions');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update transaction', { id: toastId });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight text-center">
            Edit Transaction
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Modify details for the recorded wallet transaction.
          </p>
        </div>
        <TransactionForm
          initialData={transaction}
          onSubmit={handleSubmit}
          submitLoading={submitLoading}
        />
      </div>
    </div>
  );
};

export default EditTransaction;
