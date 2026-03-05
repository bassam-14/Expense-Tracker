import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllExpenses, deleteExpense } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus, Pencil, Trash2, FileClock, Search, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);

    // Filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [timeFilter, setTimeFilter] = useState('All'); // <-- New time filter state

    const { token, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const data = await getAllExpenses(token);
                setExpenses(data);
            } catch (error) {
                console.error("Error fetching expenses:", error);
                toast.error("Session expired. Please log in again.");
                logout();
            }
        };
        fetchExpenses();
    }, [token, logout]);

    const handleDelete = (id) => {
        // ... (Keep your existing handleDelete logic here)
        toast((t) => (
            <div className="flex flex-col gap-3">
                <span className="font-medium text-slate-800">Are you sure you want to delete this?</span>
                <div className="flex gap-2">
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await deleteExpense(id, token);
                            setExpenses(expenses.filter(expense => expense.id !== id));
                            toast.success("Expense deleted");
                        } catch (error) { toast.error("Failed to delete"); }
                    }} className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700">Yes, Delete</button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 text-slate-600 px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-200">Cancel</button>
                </div>
            </div>
        ), { duration: Infinity, id: `delete-${id}` });
    };

    // Filter logic including Time
    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = (expense.merchant || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;

        // Time filter logic
        let matchesTime = true;
        if (timeFilter !== 'All' && expense.date) {
            const expDate = new Date(expense.date);
            const today = new Date();
            const diffTime = Math.abs(today - expDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (timeFilter === '7Days') matchesTime = diffDays <= 7;
            else if (timeFilter === '30Days') matchesTime = diffDays <= 30;
            else if (timeFilter === 'ThisYear') matchesTime = expDate.getFullYear() === today.getFullYear();
        }

        return matchesSearch && matchesCategory && matchesTime;
    });

    return (
        <div className="max-w-6xl mx-auto p-6 text-slate-800">
            {/* Header section */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Expenses</h2>
                <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* Action Bar with Filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">

                {/* Search and Filter Inputs */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search merchants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="relative w-full sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none shadow-sm cursor-pointer"
                        >
                            <option value="All">All Categories</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* NEW Time Filter */}
                    <div className="relative w-full sm:w-48">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none shadow-sm cursor-pointer"
                        >
                            <option value="All">All Time</option>
                            <option value="7Days">Last 7 Days</option>
                            <option value="30Days">Last 30 Days</option>
                            <option value="ThisYear">This Year</option>
                        </select>
                    </div>
                </div>

                <Link to="/add" className="w-fit">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap">
                        <Plus size={20} /> Add New Expense
                    </button>
                </Link>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Merchant</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Category</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-600">{expense.date || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                    {expense.merchant || <span className="text-slate-400 italic">Processing...</span>}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{expense.category || 'Other'}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">${expense.amount || '0.00'}</td>
                                <td className="px-6 py-4 flex justify-end gap-3">
                                    {expense.status === 'PENDING' ? (
                                        <Link to={`/review/${expense.id}`}>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors">
                                                <FileClock size={16} /> Review Draft
                                            </button>
                                        </Link>
                                    ) : (
                                        <>
                                            <button onClick={() => navigate(`/edit-expense/${expense.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors">
                                                <Pencil size={16} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(expense.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors">
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredExpenses.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        {expenses.length === 0
                            ? 'No expenses found. Click "Add New Expense" to get started!'
                            : 'No expenses match your search/filter.'}
                    </div>
                )}
            </div>
        </div>
    );
}