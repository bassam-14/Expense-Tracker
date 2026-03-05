import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadReceipt, getExpense, confirmExpense, deleteExpense, createManualExpense } from '../services/api';
import { UploadCloud, Check, X, Sparkles, Receipt, FileImage, Loader2, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddExpense() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // UI State
    const [entryMode, setEntryMode] = useState('scan'); // 'scan' or 'manual'
    const [step, setStep] = useState(1);
    const [expenseId, setExpenseId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        merchant: '',
        amount: '',
        date: '',
        category: 'Other'
    });

    const handleCancel = async () => {
        if (expenseId && loading) {
            try {
                await deleteExpense(expenseId, token);
            } catch (error) {
                console.error("Failed to delete pending expense:", error);
            }
        }
        navigate('/dashboard');
    };

    // --- SCAN: STEP 1 ---
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        try {
            const response = await uploadReceipt(file, token);
            const id = response.id || response.expenseId;
            setExpenseId(id);
            setStep(2);
        } catch (error) {
            toast.error("Upload failed.");
            setLoading(false);
        }
    };

    // --- SCAN: STEP 2 POLLING ---
    useEffect(() => {
        const isTokenValid = token && token !== "undefined" && token.includes('.');
        if (entryMode !== 'scan' || step !== 2 || !expenseId || !loading || !isTokenValid) return;

        const fetchOcrData = async () => {
            try {
                const data = await getExpense(expenseId, token);
                if (data && (data.merchant || data.amount)) {
                    setFormData({
                        merchant: data.merchant || '',
                        amount: data.amount || '',
                        date: data.date || '',
                        category: data.category || 'Other'
                    });
                    setLoading(false);
                    toast.success("AI extraction complete!");
                }
            } catch (error) {
                console.log("Waiting for AI processing...");
            }
        };

        const interval = setInterval(fetchOcrData, 3000);
        return () => clearInterval(interval);
    }, [entryMode, step, expenseId, token, loading]);

    // --- SAVE LOGIC ---
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (entryMode === 'scan') {
                await confirmExpense(expenseId, formData, token);
                toast.success("Receipt saved!");
            } else {
                await createManualExpense(formData, token);
                toast.success("Expense added manually!");
            }
            navigate('/dashboard');
        } catch (error) {
            toast.error("Failed to save.");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-800">

            {/* Header & Tabs (Only show tabs if not in the middle of scanning) */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    {entryMode === 'scan' ? <Receipt className="text-blue-600" /> : <PenTool className="text-emerald-600" />}
                    Add Expense
                </h2>
                <button onClick={handleCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                    <X size={20} />
                </button>
            </div>

            {step === 1 && (
                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setEntryMode('scan')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${entryMode === 'scan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Scan Receipt
                    </button>
                    <button
                        onClick={() => setEntryMode('manual')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${entryMode === 'manual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Manual Entry
                    </button>
                </div>
            )}

            {/* --- MANUAL ENTRY OR SCAN STEP 2 FORM --- */}
            {(entryMode === 'manual' || step === 2) ? (
                loading && entryMode === 'scan' ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Sparkles className="animate-pulse text-blue-500 mb-4" size={40} />
                        <div className="text-lg font-medium text-slate-700">Analyzing receipt with AI...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Merchant</label>
                            <input type="text" value={formData.merchant} onChange={(e) => setFormData({ ...formData, merchant: e.target.value })} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Amount ($)</label>
                            <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button type="submit" className="flex justify-center items-center gap-2 mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-semibold shadow-sm">
                            <Check size={20} />
                            Save Expense
                        </button>
                    </form>
                )
            ) : (
                /* --- SCAN STEP 1 UPLOAD --- */
                <form onSubmit={handleUpload} className="flex flex-col gap-6">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                        <FileImage className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    </div>
                    <button type="submit" disabled={loading || !file} className="flex justify-center items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-lg font-semibold shadow-sm">
                        {loading ? <><Loader2 className="animate-spin" size={20} /> Uploading...</> : <><UploadCloud size={20} /> Upload & Scan</>}
                    </button>
                </form>
            )}
        </div>
    );
}