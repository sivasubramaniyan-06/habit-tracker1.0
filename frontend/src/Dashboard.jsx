import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { AreaChart, Area, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { updateHabit, createHabit, toggleHabit, getDashboardData, addFriend, getLeaderboard } from './api';
import { Check, Plus, ChevronLeft, ChevronRight, Edit2, Users, Crown, Clock, Flame } from 'lucide-react';
import AddHabitModal from './AddHabitModal';

// --- Shared Components ---

const GridContainer = ({ children, className }) => (
    <div
        className={clsx("grid gap-[1px]", className)}
        style={{ gridTemplateColumns: "var(--main-grid)" }} // STRICT GRID USAGE
    >
        {children}
    </div>
);

const GlassCard = ({ children, className }) => (
    <div className={clsx("glass-card rounded-2xl p-6 relative overflow-hidden", className)}>
        {children}
    </div>
);

// --- Top Dashboard ---

const DashboardHeader = ({ meta, stats, onMonthChange, userInfo }) => {
    if (!stats || !meta) return null;

    const { daily_aggregates, overall_progress } = stats;
    const completionRate = overall_progress.total > 0
        ? Math.round((overall_progress.completed / overall_progress.total) * 100)
        : 0;

    const pieData = [
        { name: 'Done', value: overall_progress.completed },
        { name: 'Left', value: Math.max(0, overall_progress.total - overall_progress.completed) }
    ];

    const currentDate = new Date(meta.year, meta.month - 1);

    const handlePrev = () => onMonthChange(new Date(meta.year, meta.month - 2));
    const handleNext = () => onMonthChange(new Date(meta.year, meta.month));

    return (
        <GlassCard className="mb-8 flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[220px]">
            {/* Left: Controls & Profile */}
            <div className="flex flex-col items-start gap-4 min-w-[200px] z-10">
                <div className="flex items-center gap-3">
                    <img src={userInfo?.pic} className="w-10 h-10 rounded-full border-2 border-white shadow-md" alt="Avatar" />
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">Hello, {userInfo?.name?.split(' ')[0]}</h1>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1">CODE: <span className="bg-blue-100 text-blue-600 px-1 rounded font-bold selection:bg-blue-200">{userInfo?.friend_code}</span></div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/40 p-2 rounded-xl backdrop-blur-sm border border-white/60 shadow-inner mt-2">
                    <button onClick={handlePrev} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><ChevronLeft size={18} /></button>
                    <span className="font-bold text-slate-700 w-32 text-center select-none text-sm">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNext} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><ChevronRight size={18} /></button>
                </div>
            </div>

            {/* Middle: Area Chart */}
            <div className="flex-1 w-full h-40 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={daily_aggregates}>
                        <defs>
                            <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.8)', padding: '8px 12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="percent" stroke="#3B82F6" fillOpacity={1} fill="url(#colorPercent)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Right: Donut */}
            <div className="flex items-center gap-6 min-w-[200px]">
                <div className="relative w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={40}
                                outerRadius={55}
                                dataKey="value"
                                paddingAngle={5}
                                startAngle={90}
                                endAngle={-270}
                            >
                                <Cell fill="#3B82F6" />
                                <Cell fill="rgba(255,255,255,0.5)" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-800">{completionRate}%</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Done</span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

// --- Overview Section ---

const OverviewGrid = ({ dailyAggregates, daysInMonth }) => {
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Calculate weeks
    const weeks = [];
    for (let i = 1; i <= daysInMonth; i += 7) {
        weeks.push({ start: i, end: Math.min(i + 6, daysInMonth) });
    }

    return (
        <GridContainer className="bg-white/40 backdrop-blur-md border-b border-white/50 rounded-t-2xl overflow-hidden mt-6">
            {/* Header: Title */}
            <div className="p-4 font-bold text-slate-600 flex items-end pb-2">Overview</div>

            {/* Header: Weeks (Spanning) */}
            <div className="contents">
                {weeks.map((week, idx) => (
                    <div
                        key={`week-${idx}`}
                        className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider border-l border-white/30 py-1 bg-white/20"
                        style={{ gridColumn: `span ${week.end - week.start + 1}` }}
                    >
                        Week {idx + 1}
                    </div>
                ))}
                {Array.from({ length: 31 - daysInMonth }).map((_, i) => <div key={`e-w-${i}`} className="bg-white/10" />)}
            </div>

            {/* Header: Right Spacer */}
            <div className="bg-white/20 p-2 font-bold text-slate-600 flex items-center justify-center border-l border-white/40">
                Stats
            </div>

            {/* Row 2: Progress Bars */}
            <div className="p-4 flex items-center justify-end font-semibold text-slate-500 text-sm">Daily Trend</div>
            {daysArray.map(day => {
                const stat = dailyAggregates.find(d => d.day === day) || { percent: 0 };
                return (
                    <div key={`overview-bar-${day}`} className="border-l border-white/30 h-24 flex items-end justify-center px-[4px] py-2 relative group hover:bg-white/20 transition-colors">
                        <div className="w-full bg-blue-500 rounded-t-sm shadow-lg shadow-blue-500/30 transition-all duration-700 ease-out" style={{ height: `${stat.percent}%` }} />
                    </div>
                )
            })}
            {Array.from({ length: 31 - daysInMonth }).map((_, i) => <div key={`e-b-${i}`} className="border-l border-white/30" />)}

            {/* Right Sidebar */}
            <div className="border-l border-white/40 bg-white/10" />
        </GridContainer>
    );
}

// --- Habit Row ---

const HabitRow = ({ habit, logs, daysInMonth, onToggle, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(habit.name);

    // Streaks and Time
    const streak = habit.current_streak || 0;
    const time = habit.scheduled_time || "09:00";

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const habitLogs = logs.filter(l => l.habit_id === habit.id);
    const doneCount = habitLogs.length;
    const progress = Math.round((doneCount / daysInMonth) * 100);

    const handleSave = async () => {
        setIsEditing(false);
        if (name !== habit.name) await onUpdate(habit.id, { name });
    }

    return (
        <GridContainer className="bg-white/60 backdrop-blur-sm border-b border-white/40 hover:bg-white/80 transition-colors group">
            {/* Column 1: Habit Info */}
            <div className="p-3 pl-6 flex items-center gap-3 relative">
                <span className="text-2xl filter drop-shadow-sm">{habit.icon}</span>
                <div className="flex flex-col min-w-0">
                    {isEditing ? (
                        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={handleSave} autoFocus className="bg-transparent border-b-2 border-blue-500 outline-none w-full font-semibold text-slate-700" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-slate-700 truncate cursor-pointer select-none" onClick={() => setIsEditing(true)}>{habit.name}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-100 px-1 rounded"><Clock size={10} /> {time}</span>
                        {streak > 1 && <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1"><Flame size={10} /> {streak} day streak</span>}
                    </div>
                </div>
            </div>

            {/* Checkboxes */}
            {daysArray.map(day => (<HabitCell key={day} day={day} habitId={habit.id} logs={habitLogs} onToggle={onToggle} />))}
            {Array.from({ length: 31 - daysInMonth }).map((_, i) => <div key={`e-r-${i}`} className="border-l border-white/30" />)}

            {/* Right Stat */}
            <div className="p-3 border-l border-white/40 flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-500 w-8 text-right">{progress}%</span>
            </div>
        </GridContainer>
    )
}

const HabitCell = ({ day, habitId, logs, onToggle }) => {
    const isDone = logs.some(l => parseInt(l.date.split('-')[2]) === day);
    return (
        <div className="border-l border-white/30 flex items-center justify-center">
            <button onClick={() => onToggle(habitId, day)} className={clsx("w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 neumorphic-checkbox", isDone ? "checked" : "hover:scale-105")}>
                {isDone && <Check size={14} className="text-white font-bold" strokeWidth={4} />}
            </button>
        </div>
    )
}

// --- Social Sidebar ---
const SocialSidebar = () => {
    const [friends, setFriends] = useState([]);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const loadLeaders = async () => {
        try {
            const res = await getLeaderboard();
            setFriends(res.data);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => { loadLeaders(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!code) return;
        setLoading(true);
        try {
            await addFriend(code);
            alert("Friend Added!");
            setCode("");
            loadLeaders();
        } catch (e) {
            alert("Error: " + (e.response?.data?.detail || "Failed"));
        }
        setLoading(false);
    }

    return (
        <GlassCard className="h-fit">
            <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-4"><Users size={18} /> Social Circle</h3>
            <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                <input placeholder="Friend Code" className="w-full text-xs p-2 rounded bg-white/50 border border-white/60 outline-none" value={code} onChange={e => setCode(e.target.value)} />
                <button disabled={loading} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"><Plus size={14} /></button>
            </form>

            <div className="space-y-4">
                {friends.map((f, i) => (
                    <div key={f.username} className="flex items-center gap-3">
                        <div className="relative">
                            <img src={f.profile_picture} className="w-8 h-8 rounded-full border border-white shadow-sm" />
                            {i === 0 && <div className="absolute -top-2 -right-2 text-yellow-500"><Crown size={12} fill="currentColor" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-700 truncate">{f.full_name} {f.is_me && "(You)"}</div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${f.score}%` }} />
                            </div>
                        </div>
                        <span className="text-xs font-bold text-purple-600">{f.score}%</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    )
}


// --- Main App ---

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (dateObj) => {
        try {
            setLoading(true);
            setError(null);
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            const res = await getDashboardData(year, month);
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError(err.message || 'Failed to connect to backend');
            // Set empty data structure so UI doesn't break
            setData({
                user_info: {
                    name: 'Habit Tracker User',
                    friend_code: 'OFFLINE',
                    pic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HabitMaster'
                },
                habits: [],
                logs: [],
                stats: {
                    daily_aggregates: [],
                    overall_progress: { completed: 0, total: 0 },
                    total_habits: 0
                },
                meta: {
                    year: dateObj.getFullYear(),
                    month: dateObj.getMonth() + 1,
                    days_in_month: new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate()
                }
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(currentDate); }, [currentDate]);

    const handleToggle = async (habitId, day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Optimistic UI
        const existingLog = data.logs.find(l => l.habit_id === habitId && l.date === dateStr);
        let newLogs = existingLog ? data.logs.filter(l => l !== existingLog) : [...data.logs, { habit_id: habitId, date: dateStr, completed: true }];
        setData(prev => ({ ...prev, logs: newLogs }));

        try { await toggleHabit(habitId, dateStr); fetchData(currentDate); }
        catch (e) { console.error(e); fetchData(currentDate); }
    };

    const handleUpdateHabit = async (id, updates) => {
        try { await updateHabit(id, updates); fetchData(currentDate); } catch (e) { console.error(e) }
    }

    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-slate-500 font-semibold animate-pulse mb-4">Loading Your Life...</div>
                    <div className="text-xs text-slate-400">Connecting to backend...</div>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-800 mb-2">Backend Connection Failed</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => fetchData(currentDate)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        Retry Connection
                    </button>
                    <p className="text-xs text-red-500 mt-4">
                        Make sure your backend is running and VITE_API_URL is configured correctly.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 px-4 pt-8 max-w-[1700px] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">
                {/* Main Dashboard */}
                <div className="overflow-x-auto">
                    <DashboardHeader meta={data.meta} stats={data.stats} onMonthChange={setCurrentDate} userInfo={data.user_info} />

                    <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl min-w-max mb-20">
                        <OverviewGrid dailyAggregates={data.stats.daily_aggregates} daysInMonth={data.meta.days_in_month} />
                        <div className="bg-white/30 backdrop-blur-md">
                            {data.habits.map(habit => (
                                <HabitRow key={habit.id} habit={habit} logs={data.logs} daysInMonth={data.meta.days_in_month} onToggle={handleToggle} onUpdate={handleUpdateHabit} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 hidden xl:block sticky top-8">
                    <SocialSidebar />
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50 hover:shadow-blue-500/50"
            >
                <Plus size={28} />
            </button>

            <AddHabitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchData(currentDate)}
            />
        </div>
    )
}
