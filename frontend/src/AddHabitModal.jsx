import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { createHabit } from './api';

const EMOJI_OPTIONS = ["📝", "🏃", "💧", "🧘", "📚", "💻", "🎨", "🎵", "💰", "🍳"];

export default function AddHabitModal({ isOpen, onClose, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        icon: "📝",
        target_days: 30,
        scheduled_time: "09:00"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createHabit(formData);
            onSuccess();
            setFormData({ name: "", icon: "📝", target_days: 30, scheduled_time: "09:00" });
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to create habit");
        }
        setIsLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">New Habit</h3>
                                <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                    <input
                                        required
                                        autoFocus
                                        placeholder="e.g. Morning Jog"
                                        className="w-full p-3 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                                        <input
                                            type="time"
                                            className="w-full p-3 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            value={formData.scheduled_time}
                                            onChange={e => setFormData({ ...formData, scheduled_time: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Goal (Days)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            className="w-full p-3 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            value={formData.target_days}
                                            onChange={e => setFormData({ ...formData, target_days: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Icon</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {EMOJI_OPTIONS.map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: emoji })}
                                                className={`p-3 rounded-xl text-xl transition-all ${formData.icon === emoji
                                                        ? "bg-blue-100 ring-2 ring-blue-500 scale-110"
                                                        : "bg-white/50 hover:bg-white"
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 mt-4"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Create Habit</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
