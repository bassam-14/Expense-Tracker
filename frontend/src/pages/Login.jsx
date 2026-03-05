import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            login(response.token);
        } catch (error) {
            toast.error("Login failed.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-sm p-8">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                    <p className="text-slate-500">Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex justify-center items-center gap-2 mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                        <LogIn size={20} />
                        Log In
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                        Sign up here
                    </Link>
                </p>
            </div>
        </div>
    );
}