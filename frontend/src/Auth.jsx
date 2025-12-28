import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register } from './api';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const res = await login(formData);
            localStorage.setItem('token', res.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-black text-slate-800 mb-6 text-center">Welcome Back</h2>
                {error && <div className="text-red-500 mb-4 text-center text-sm font-semibold">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Username</label>
                        <input className="w-full p-3 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-1">Password</label>
                        <input type="password" className="w-full p-3 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                        Login
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-slate-500">
                    New here? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create Account</Link>
                </div>
            </div>
        </div>
    )
}

export const Register = () => {
    const [formData, setFormData] = useState({ username: '', password: '', full_name: '', age: '', bio: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            const loginData = new URLSearchParams();
            loginData.append('username', formData.username);
            loginData.append('password', formData.password);
            const res = await login(loginData);
            localStorage.setItem('token', res.data.access_token);
            navigate('/dashboard');
        } catch (err) {
            alert('Registration Failed: ' + (err.response?.data?.detail || err.message));
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-black text-slate-800 mb-2 text-center">Join HabitMaster</h2>
                <p className="text-center text-slate-500 mb-6 text-sm">Start your streak today.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input placeholder="Full Name" className="w-full p-3 rounded-xl bg-white/50 border border-white/40 outline-none" onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    <input placeholder="Username" className="w-full p-3 rounded-xl bg-white/50 border border-white/40 outline-none" onChange={e => setFormData({ ...formData, username: e.target.value })} />
                    <input type="password" placeholder="Password" className="w-full p-3 rounded-xl bg-white/50 border border-white/40 outline-none" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <div className="flex gap-2">
                        <input placeholder="Age" type="number" className="w-1/3 p-3 rounded-xl bg-white/50 border border-white/40 outline-none" onChange={e => setFormData({ ...formData, age: e.target.value })} />
                        <input placeholder="Bio (Optional)" className="w-2/3 p-3 rounded-xl bg-white/50 border border-white/40 outline-none" onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                    </div>
                    <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition shadow-xl mt-2">
                        Start Journey
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
                </div>
            </div>
        </div>
    )
}
