import React from 'react';

const Sidebar = ({ habits }) => {
    return (
        <div className="w-full lg:w-80 bg-white border-l border-sheet-border p-6 h-full">
            <h2 className="text-xl font-bold text-sheet-text mb-6">Top Daily Habits</h2>
            <div className="space-y-3">
                {habits.map((habit) => (
                    <div key={habit.id} className="flex items-center p-3 bg-sheet-bg rounded-lg hover:bg-sheet-header transition-colors shadow-sm border border-transparent hover:border-sheet-border">
                        <span className="text-2xl mr-4 bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm">{habit.icon}</span>
                        <div>
                            <p className="font-semibold text-sheet-text">{habit.name}</p>
                            <p className="text-xs text-sheet-secondary">Daily Goal</p>
                        </div>
                    </div>
                ))}
                {habits.length === 0 && (
                    <p className="text-sheet-secondary text-sm">No habits found.</p>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
