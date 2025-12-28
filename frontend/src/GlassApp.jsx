import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { updateHabit, createHabit } from './api';
import { Check, Plus, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';

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

const DashboardHeader = ({ meta, stats, onMonthChange }) => {
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

    const handlePrev = () => {
        const d = new Date(meta.year, meta.month - 2); // Month is 1-indexed in meta, JS is 0
        onMonthChange(d);
    }
    const handleNext = () => {
        const d = new Date(meta.year, meta.month);
        onMonthChange(d);
    }

    return (
        <GlassCard className="mb-8 flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[220px]">
            {/* Left: Controls */}
            <div className="flex flex-col items-start gap-4 min-w-[200px] z-10">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Habit<span className="text-blue-500">Master</span></h1>
                <div className="flex items-center gap-4 bg-white/40 p-2 rounded-xl backdrop-blur-sm border border-white/60 shadow-inner">
                    <button onClick={handlePrev} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><ChevronLeft size={20} /></button>
                    <span className="font-bold text-slate-700 w-32 text-center select-none">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNext} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600"><ChevronRight size={20} /></button>
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
                <div className="space-y-2">
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-slate-800">{overall_progress.completed}</span>
                        <span className="text-xs text-slate-500 font-medium">Completed</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-semibold text-slate-400">{overall_progress.total - overall_progress.completed}</span>
                        <span className="text-xs text-slate-400 font-medium">Remaining</span>
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
                {/* Fill empty */}
                {Array.from({ length: 31 - daysInMonth }).map((_, i) => <div key={`e-w-${i}`} className="bg-white/10" />)}
            </div>

            {/* Header: Right Spacer */}
            <div className="bg-white/20 p-2 font-bold text-slate-600 flex items-center justify-center border-l border-white/40">
                Summary
            </div>


            {/* Row 2: Progress Bars */}
            <div className="p-4 flex items-center justify-end font-semibold text-slate-500 text-sm">
                Daily Trend
            </div>
            {daysArray.map(day => {
                const stat = dailyAggregates.find(d => d.day === day) || { percent: 0 };
                return (
                    <div key={`overview-bar-${day}`} className="border-l border-white/30 h-24 flex items-end justify-center px-[4px] py-2 relative group hover:bg-white/20 transition-colors">
                        <div
                            className="w-full bg-blue-500 rounded-t-sm shadow-lg shadow-blue-500/30 transition-all duration-700 ease-out"
                            style={{ height: `${stat.percent}%` }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {stat.percent}%
                        </div>
                    </div>
                )
            })}
            {Array.from({ length: 31 - daysInMonth }).map((_, i) => <div key={`e-b-${i}`} className="border-l border-white/30" />)}

            {/* Right Sidebar: Monthly Progress Text */}
            <div className="border-l border-white/40 p-4 flex flex-col justify-center text-sm text-slate-500 font-medium">
                <p>Consistency is key.</p>
            </div>


            {/* Row 3: Counts */}
            <div className="p-4 flex flex-col justify-center items-end text-xs font-medium text-slate-400">
                <span>Completed</span>
            </div>
            {daysArray.map(day => {
                const stat = dailyAggregates.find(d => d.day === day) || { completed_count: 0 };
                return (
                    <div key={`count-${day}`} className="border-l border-white/30 py-2 flex flex-col items-center justify-center">
                        <span className="font-bold text-blue-600 text-sm">{stat.completed_count}</span>
                    </div>
                )
            })}
            {Array.from({ length: 31 - daysInMonth }).map((_, i) => <div key={`e-c-${i}`} className="border-l border-white/30" />)}

            <div className="border-l border-white/40 bg-white/10" />

        </GridContainer>
    );
}

// --- Habit Row ---

const HabitRow = ({ habit, logs, daysInMonth, onToggle, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(habit.name);
    const inputRef = useRef(null);

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Calculate stats
    const habitLogs = logs.filter(l => l.habit_id === habit.id); // Assuming logs filtered by backend to month
    const doneCount = habitLogs.length;
    const progress = Math.round((doneCount / daysInMonth) * 100);

    const handleSave = async () => {
        setIsEditing(false);
        if (name !== habit.name) {
            await onUpdate(habit.id, { name });
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
    }

    return (
        <GridContainer className="bg-white/60 backdrop-blur-sm border-b border-white/40 hover:bg-white/80 transition-colors group">
            {/* Column 1: Habit Info */}
            <div className="p-3 pl-6 flex items-center gap-3 relative">
                <span className="text-2xl filter drop-shadow-sm">{habit.icon}</span>
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="bg-transparent border-b-2 border-blue-500 outline-none w-full font-semibold text-slate-700"
                    />
                ) : (
                    <span
                        className="font-semibold text-slate-700 truncate cursor-pointer select-none"
                        onClick={() => setIsEditing(true)}
                    >
                        {habit.name}
                    </span>
                )}
                {!isEditing && (
                    <Edit2
                        size={12}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 cursor-pointer hover:text-blue-500"
                        onClick={() => setIsEditing(true)}
                    />
                )}
            </div>

            {/* Checkboxes */}
            {daysArray.map(day => {
                // Find log
                // IMPORTANT: We need to match date strictly. 
                // logs date is YYYY-MM-DD. We assume passing compatible date string or day filtering
                // The parent component passes `logs` which are already filtered for this habit? No, global logs.
                // We need date string.
                // Let's rely on props to give us a `checkLog` function or similar to avoid re-date calc overhead?
                // Or just do it:
                // We don't have year/month here easily unless passed.
                // Actually `logs` contains date objects usually or strings.
                // Let's pass a `getLogStatus` helper or context.
                // Simple fix: We pass `year` `month` to this component too.
                return (
                    <HabitCell key={day} day={day} habitId={habit.id} logs={habitLogs} onToggle={onToggle} />
                );
            })}
            {/* Fill empty */}
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
    // We assume logs are just for this month, so we check day part of date.
    // logs: [{date: "2025-12-01"}]
    // We check if any log date ends with -{day} formatted.

    // Optimization: Just check logs for day match. Match logic might be fragile if not strict.
    // Better: logs are filtered.
    const isDone = logs.some(l => parseInt(l.date.split('-')[2]) === day);

    return (
        <div className="border-l border-white/30 flex items-center justify-center">
            <button
                onClick={() => onToggle(habitId, day)}
                className={clsx(
                    "w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 neumorphic-checkbox",
                    isDone ? "checked" : "hover:scale-105"
                )}
            >
                {isDone && <Check size={14} className="text-white font-bold" strokeWidth={4} />}
            </button>
        </div>
    )
}

// --- New Habit Row ---
const NewHabitRow = ({ onAdd }) => {
    const [name, setName] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onAdd({ name, icon: "✨", target_days: 30 });
        setName("");
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <div className="p-8 flex justify-center">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/50 backdrop-blur border border-white/60 shadow-lg text-slate-600 font-semibold hover:bg-white hover:scale-105 transition-all text-sm"
                >
                    <Plus size={18} /> Add New Habit
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto w-[250px] p-4 bg-white/60 backdrop-blur rounded-xl shadow-xl mt-4 border border-white flex gap-2">
            <input
                autoFocus
                placeholder="Habit Name..."
                className="bg-transparent outline-none w-full text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" className="text-blue-500 hover:bg-blue-100 p-1 rounded"><Check size={18} /></button>
        </form>
    )
}


// --- Main App ---

export default function GlassApp() {
    const [data, setData] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchData = async (dateObj) => {
        try {
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            const res = await api.get(`/dashboard/${year}/${month}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchData(currentDate);
    }, [currentDate]);

    const handleToggle = async (habitId, day) => {
        // Optimistic
        // We need full date string.
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Optimistic update of local Logs state? 
        // Complex because logs are inside data object.
        // Let's just create log object.
        const existingLog = data.logs.find(l => l.habit_id === habitId && l.date === dateStr);

        // Create new logs array
        let newLogs;
        if (existingLog) {
            newLogs = data.logs.filter(l => l !== existingLog);
        } else {
            newLogs = [...data.logs, { habit_id: habitId, date: dateStr, completed: true }];
        }

        // Recalc stats optimistically? Hard.
        // Simple strategy: Update UI checkbox instantly via state, Fetch in background.
        // We can update `data.logs` directly.
        setData(prev => ({ ...prev, logs: newLogs }));

        try {
            await toggleHabit(habitId, dateStr);
            // Refresh valid stats
            fetchData(currentDate); // Debounce this in real app
        } catch (e) {
            console.error(e);
            fetchData(currentDate); // Revert
        }
    };

    const handleUpdateHabit = async (id, updates) => {
        try {
            await updateHabit(id, updates);
            fetchData(currentDate);
        } catch (e) { console.error(e) }
    }

    const handleAddHabit = async (habitData) => {
        try {
            await createHabit(habitData);
            fetchData(currentDate);
        } catch (e) { console.error(e) }
    }


    if (!data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="pb-20 px-4 pt-8 max-w-[1600px] mx-auto overflow-x-auto">
            <DashboardHeader
                meta={data.meta}
                stats={data.stats}
                onMonthChange={setCurrentDate}
            />

            {/* Main Content Area */}
            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl min-w-max">
                <OverviewGrid
                    dailyAggregates={data.stats.daily_aggregates}
                    daysInMonth={data.meta.days_in_month}
                />

                <div className="bg-white/30 backdrop-blur-md">
                    {data.habits.map(habit => (
                        <HabitRow
                            key={habit.id}
                            habit={habit}
                            logs={data.logs} // Pass all logs, row filters them.
                            daysInMonth={data.meta.days_in_month}
                            onToggle={handleToggle}
                            onUpdate={handleUpdateHabit}
                        />
                    ))}
                </div>
            </div>

            <NewHabitRow onAdd={handleAddHabit} />
        </div>
    )
}
