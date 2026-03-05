import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getExpense, confirmExpense } from '../services/api';
import { Pencil, X, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditExpense() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [formData, setFormData] = useState({
        merchant: '', amount: '', date: '', category: 'Other'
    });

    useEffect(() => {
        const isTokenValid = token && token !== "undefined" && token.includes('.');
        // Stop if conditions aren't met or we already have the data locked in
        if (!id || !isTokenValid || hasData) return;

        const fetchExpenseData = async () => {
            try {
                const data = await getExpense(id, token);

                // Stop polling if AI is done OR if this is an already confirmed expense
                if (data && (data.merchant || data.amount || data.status === 'CONFIRMED')) {
                    setFormData({
                        merchant: data.merchant || '',
                        amount: data.amount || '',
                        date: data.date || '',
                        category: data.category || 'Other'
                    });
                    setHasData(true); // Lock it so polling stops and user edits are safe
                    setLoading(false);
                }
            } catch (error) {
                console.log("Waiting for data...");
            }
        };

        const interval = setInterval(fetchExpenseData, 3000);
        fetchExpenseData(); // Initial call

        return () => clearInterval(interval);
    }, [id, token, hasData]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await confirmExpense(id, formData, token);
            navigate('/dashboard');
        } catch (error) {
            toast.error("Failed to save changes.");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-800">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Pencil className="text-blue-600" />
                    {loading ? "Processing..." : "Edit Expense"}
                </h2>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Cancel"
                >
                    <X size={20} />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Sparkles className="animate-pulse text-blue-500 mb-4" size={40} />
                    <div className="text-lg font-medium text-slate-700">Waiting for AI extraction...</div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="flex flex-col gap-5">

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Merchant</label>
                        <input
                            type="text"
                            value={formData.merchant}
                            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                        >
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="flex justify-center items-center gap-2 mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                        <Save size={20} />
                        Save Changes
                    </button>
                </form>
            )}
        </div>
    );
}