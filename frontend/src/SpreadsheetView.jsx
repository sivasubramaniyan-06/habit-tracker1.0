import React, { useMemo } from 'react';
import clsx from 'clsx';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Grid Layout Constant from CSS/Tailwind config logic
// We are using 'grid-cols-sheet' which is defined as: 250px repeat(31, minmax(32px, 1fr)) 300px

const OverviewSection = ({ dailyAggregates, currentMonth, daysInMonth, daysArray, stats }) => {
    // Generate Week Headers
    const weeks = [];
    for (let i = 1; i <= daysInMonth; i += 7) {
        weeks.push({ start: i, end: Math.min(i + 6, daysInMonth) });
    }

    return (
        <>
            {/* Row 1: Week Headers */}
            {/* The first cell is empty/Title (above Habit Name) */}
            <div className="border-b border-r border-sheet-border bg-sheet-header p-2 font-bold text-sheet-text sticky left-0 z-20 flex items-center">
                Month Overview
            </div>

            {/* Week Headers spanning columns */}
            <div className="contents">
                {weeks.map((week, idx) => (
                    <div
                        key={idx}
                        className="bg-sheet-header border-b border-r border-sheet-border text-center text-xs font-semibold text-sheet-secondary flex items-center justify-center border-l-0"
                        style={{ gridColumn: `span ${week.end - week.start + 1}` }}
                    >
                        Week {idx + 1}
                    </div>
                ))}
                {Array.from({ length: 31 - daysInMonth }).map((_, i) => (
                    <div key={`empty-week-${i}`} className="bg-sheet-header border-b border-sheet-border" />
                ))}
            </div>

            {/* Sidebar Header Space */}
            <div className="bg-sheet-header border-b border-sheet-border text-center font-bold text-sheet-text flex items-center justify-center">
                Monthly Progress
            </div>


            {/* Row 2: Global Progress Bars */}
            <div className="border-b border-r border-sheet-border bg-white p-2 font-medium text-sm text-sheet-text sticky left-0 z-10 flex items-center justify-end pr-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Daily Trend
            </div>

            {/* Bars for each day */}
            {daysArray.map(day => {
                const dayStats = dailyAggregates.find(d => d.day === day);
                const percent = dayStats ? dayStats.percent : 0;
                return (
                    <div key={`bar-${day}`} className="relative border-b border-r border-sheet-border bg-white h-24 flex items-end justify-center p-[2px]">
                        <div
                            className="w-full bg-blue-500/80 rounded-t-sm transition-all duration-500"
                            style={{ height: `${percent}%` }}
                            title={`Day ${day}: ${percent}%`}
                        />
                    </div>
                );
            })}
            {/* Empty filler for month end */}
            {Array.from({ length: 31 - daysInMonth }).map((_, i) => (
                <div key={`empty-bar-${i}`} className="border-b border-r border-sheet-border bg-gray-50" />
            ))}

            {/* Sidebar Overview Content: Donut Chart spanning Rows 2 (Trend) & 3 (Counts) */}
            <div className="row-span-2 border-b border-l border-sheet-border bg-white p-2 flex flex-col items-center justify-center">
                {stats && (
                    <div className="relative w-32 h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Completed', value: stats.overall_progress.completed },
                                        { name: 'Remaining', value: Math.max(0, stats.overall_progress.total - stats.overall_progress.completed) },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={25}
                                    outerRadius={40}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <Cell fill="#1E88E5" />
                                    <Cell fill="#E2E8F0" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-sm font-bold text-sheet-text">
                                {stats.overall_progress.total > 0
                                    ? Math.round((stats.overall_progress.completed / stats.overall_progress.total) * 100)
                                    : 0}%
                            </span>
                        </div>
                    </div>
                )}
                <div className="text-[10px] text-center text-sheet-secondary -mt-2">Completion Rate</div>
            </div>


            {/* Row 3: Counts */}
            <div className="border-b border-r border-sheet-border bg-gray-50 p-2 font-medium text-xs text-right sticky left-0 z-10 flex flex-col justify-center pr-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div className="text-blue-600">Completed</div>
                <div className="text-slate-400">Total</div>
            </div>
            {daysArray.map(day => {
                const dayStats = dailyAggregates.find(d => d.day === day);
                return (
                    <div key={`count-${day}`} className="border-b border-r border-sheet-border bg-gray-50 text-[10px] flex flex-col items-center justify-center py-2">
                        <span className="font-bold text-blue-600">{dayStats?.completed_count || 0}</span>
                        <span className="text-slate-400">{dayStats?.total_active || 0}</span>
                    </div>
                );
            })}
            {Array.from({ length: 31 - daysInMonth }).map((_, i) => (
                <div key={`empty-count-${i}`} className="border-b border-r border-sheet-border bg-gray-50" />
            ))}

            {/* Sidebar row-span handled above, this cell is skipped by grid auto-placement if we are careful, 
                BUT in explicit grid we might need to handle it.
                Since the previous div was `row-span-2`, we don't need a div here for the 3rd row of the sidebar column. 
                CSS Grid handles this automatically if placed correctly. 
            */}
        </>
    );
};

const HabitRow = ({ habit, daysArray, logs, currentMonth, onToggle, daysInMonth }) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const getLogStatus = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr);
        return { completed: !!log, date: dateStr };
    };

    const totalCompleted = logs.filter(l => l.habit_id === habit.id).length;

    return (
        <div className="contents group">
            {/* Label Column */}
            <div className="border-b border-r border-sheet-border bg-white p-2 pl-4 flex items-center gap-3 font-medium text-sheet-text sticky left-0 z-10 cursor-pointer hover:bg-sheet-header transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] h-10">
                <span className="text-xl">{habit.icon}</span>
                <span className="truncate">{habit.name}</span>
            </div>

            {/* Date Columns */}
            {daysArray.map(day => {
                const { completed, date } = getLogStatus(day);
                return (
                    <div
                        key={day}
                        onClick={() => onToggle(habit.id, date)}
                        className={clsx(
                            "border-b border-r border-sheet-border h-10 flex items-center justify-center cursor-pointer transition-colors duration-200",
                            completed ? "bg-sheet-active hover:bg-blue-300" : "bg-white hover:bg-gray-100"
                        )}
                        title={`${habit.name} - ${date}`}
                    >
                    </div>
                );
            })}
            {Array.from({ length: 31 - daysInMonth }).map((_, i) => (
                <div key={`empty-row-${i}`} className="border-b border-r border-sheet-border bg-gray-50" />
            ))}

            {/* Right Sidebar Stats (Row Slice) */}
            <div className="border-b border-l border-sheet-border bg-white px-4 flex items-center justify-between text-xs text-sheet-secondary">
                <span className="font-semibold">{totalCompleted} Done</span>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-2">
                    <div className="h-full bg-blue-500" style={{ width: `${(totalCompleted / daysInMonth) * 100}%` }} />
                </div>
            </div>
        </div>
    );
};


const SpreadsheetView = ({ habits, logs, dailyAggregates, currentMonth, onToggle, stats }) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="grid grid-cols-sheet min-w-max border-t border-l border-sheet-border">
                <OverviewSection
                    dailyAggregates={dailyAggregates || []}
                    currentMonth={currentMonth}
                    daysInMonth={daysInMonth}
                    daysArray={daysArray}
                    stats={stats}
                />

                {habits.map(habit => (
                    <HabitRow
                        key={habit.id}
                        habit={habit}
                        daysArray={daysArray}
                        daysInMonth={daysInMonth}
                        logs={logs}
                        currentMonth={currentMonth}
                        onToggle={onToggle}
                    />
                ))}
            </div>
        </div>
    );
};

export default SpreadsheetView;
