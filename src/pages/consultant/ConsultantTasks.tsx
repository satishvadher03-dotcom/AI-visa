import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
}

export const ConsultantTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Verify passport remaining validity on case AV-2026-98124 (Dubai eVisa)',
      category: 'Document Audit',
      completed: true,
      priority: 'HIGH',
    },
    {
      id: '2',
      title: 'Verify biometric photo resolution and plain white background for Priya Sharma',
      category: 'Biometric Check',
      completed: false,
      priority: 'HIGH',
    },
    {
      id: '3',
      title: 'Check 6-month liquid balance on UK Standard Visitor application',
      category: 'Financial Proof',
      completed: false,
      priority: 'MEDIUM',
    },
    {
      id: '4',
      title: 'Submit verified dossier to ICP UAE Federal smartservices portal',
      category: 'Official Submission',
      completed: false,
      priority: 'HIGH',
    },
    {
      id: '5',
      title: 'Prepare itinerary review notes for 11:00 AM video consultation',
      category: 'Hearing Prep',
      completed: false,
      priority: 'NORMAL',
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'NORMAL'>('NORMAL');

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        category: 'Casework',
        completed: false,
        priority: newTaskPriority,
      },
    ]);
    setNewTaskTitle('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
          Casework Checklist
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Specialist Action Tasks ({tasks.filter((t) => !t.completed).length} Pending)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Daily compliance milestones, pre-submission audits, and consular checks
        </p>
      </div>

      {/* Add Task Input */}
      <form onSubmit={addTask} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new casework reminder or compliance check..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as any)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <option value="NORMAL">Normal</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High Priority</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </form>

      {/* Tasks List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 flex items-center justify-between transition ${
              task.completed ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="text-slate-400 hover:text-blue-600 cursor-pointer"
              >
                {task.completed ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </button>
              <div>
                <span
                  className={`text-xs font-semibold block ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-[10px] text-slate-400">{task.category}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  task.priority === 'HIGH'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : task.priority === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {task.priority}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsultantTasks;
