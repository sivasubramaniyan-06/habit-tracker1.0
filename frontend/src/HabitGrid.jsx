import React from 'react';
import clsx from 'clsx';

const HabitGrid = ({ habits, logs, currentMonth, onToggle }) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getLogStatus = (habitId, day) => {
        // Format date YYYY-MM-DD
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // logs have date as YYYY-MM-DD string from API (or we ensure it matches)
        const log = logs.find(l => l.habit_id === habitId && l.date === dateStr);
        return { completed: !!log, date: dateStr };
    };

    return (
        <div className="overflow-x-auto bg-white border border-sheet-border rounded-lg shadow-sm">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-sheet-header h-10">
                        <th className="p-2 pl-4 text-left font-semibold text-sheet-text border-b border-r border-sheet-border sticky left-0 bg-sheet-header z-10 w-48 min-w-[12rem] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            Habit
                        </th>
                        {daysArray.map(day => (
                            <th key={day} className="p-1 min-w-[2rem] w-10 text-center text-sheet-secondary font-medium border-b border-r border-sheet-border last:border-r-0 select-none">
                                {day}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {habits.map((habit) => (
                        <tr key={habit.id} className="hover:bg-gray-50 group h-12">
                            <td className="p-2 pl-4 border-b border-r border-sheet-border bg-white sticky left-0 z-10 group-hover:bg-gray-50 font-medium text-sheet-text flex items-center gap-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <span className="text-xl">{habit.icon}</span>
                                <span className="truncate">{habit.name}</span>
                            </td>
                            {daysArray.map((day) => {
                                const { completed, date } = getLogStatus(habit.id, day);
                                return (
                                    <td
                                        key={day}
                                        className={clsx(
                                            "border-b border-r border-sheet-border last:border-r-0 cursor-pointer transition-all duration-200",
                                            completed ? "bg-sheet-active hover:bg-blue-300" : "bg-white hover:bg-gray-100"
                                        )}
                                        onClick={() => onToggle(habit.id, date)}
                                        title={`${habit.name} - Day ${day}: ${completed ? 'Done' : 'Not Done'}`}
                                    >
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {/* Empty state filling rows for visual appeal if few habits? No, let's keep it clean. */}
                </tbody>
            </table>
        </div>
    );
};

export default HabitGrid;
