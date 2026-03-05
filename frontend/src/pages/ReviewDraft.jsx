import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getExpense, confirmExpense } from '../services/api';
import { FileClock, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewDraft() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        merchant: '',
        amount: '',
        date: '',
        category: 'Other'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token || token === "undefined") return;

        const fetchExpense = async () => {
            try {
                const data = await getExpense(id, token);
                if (data) {
                    setFormData({
                        merchant: data.merchant || '',
                        amount: data.amount || '',
                        date: data.date || '',
                        category: data.category || 'Other'
                    });
                }
            } catch (error) {
                console.error(error);
                toast.error("Could not load expense data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpense();
    }, [id, token]);

    const handleConfirm = async (e) => {
        e.preventDefault();
        try {
            await confirmExpense(id, formData, token);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("Failed to save expense.");
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-lg mx-auto mt-10 flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">
                <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
                <div className="text-lg font-medium text-slate-700">Loading draft data...</div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-800">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileClock className="text-amber-500" />
                        Review & Save
                    </h2>
                </div>
            </div>

            <form onSubmit={handleConfirm} className="flex flex-col gap-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Merchant</label>
                    <input
                        type="text"
                        value={formData.merchant}
                        onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total Amount ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-white"
                    >
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Side-by-side Buttons */}
                <div className="flex gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                        <X size={20} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                        <Check size={20} />
                        Confirm & Save
                    </button>
                </div>
            </form>
        </div>
    );
}