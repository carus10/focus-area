import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext.tsx';
import { Task } from '../types.ts';
import Icon from '../components/Icon.tsx';

const Tasks: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, clearCompletedTasks } = useContext(DataContext);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  
  const completedTasks = useMemo(() => tasks.filter(t => t.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)), [tasks]);

  const groupedCompletedTasks = useMemo(() => {
    return completedTasks.reduce((acc, task) => {
      if (!task.completedAt) return acc;
      const date = new Date(task.completedAt).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [completedTasks]);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-400 dark:to-violet-300">Görevler</h1>
      
      <div className="bg-light-card/60 dark:bg-dark-card/50 backdrop-blur-2xl p-4 rounded-2xl shadow-lg border border-white/20 dark:border-white/10 mb-6">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Yeni bir görev ekle..."
            className="flex-grow bg-gray-500/10 dark:bg-white/5 border-transparent rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
          />
          <button type="submit" className="bg-primary text-white p-2 rounded-md hover:bg-primary-hover px-4 font-semibold text-sm flex items-center">
            <Icon name="Plus" className="w-4 h-4 mr-1" /> Ekle
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto">
        {/* Active Tasks */}
        <div className="bg-light-card/60 dark:bg-dark-card/50 backdrop-blur-2xl p-4 rounded-2xl shadow-lg border border-white/20 dark:border-white/10 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Aktif Görevler</h2>
          <ul className="space-y-2 overflow-y-auto flex-grow">
            {activeTasks.length > 0 ? activeTasks.map(task => (
              <li key={task.id} className="flex items-center justify-between p-2 rounded-md bg-gray-500/5 dark:bg-white/5 group">
                <div className="flex items-center">
                  <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-3" />
                  <span className="text-sm">{task.text}</span>
                </div>
                <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-500/20 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="Trash2" className="w-4 h-4" />
                </button>
              </li>
            )) : <p className="text-center text-sm text-gray-400 py-4">Harika! Hiç aktif görevin yok.</p>}
          </ul>
        </div>
        
        {/* Completed Tasks */}
        <div className="bg-light-card/60 dark:bg-dark-card/50 backdrop-blur-2xl p-4 rounded-2xl shadow-lg border border-white/20 dark:border-white/10 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tamamlanan Görevler</h2>
            {completedTasks.length > 0 && (
                <button onClick={clearCompletedTasks} className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center">
                    <Icon name="Trash2" className="w-3 h-3 mr-1" /> Geçmişi Temizle
                </button>
            )}
          </div>
          <div className="overflow-y-auto flex-grow">
            {Object.keys(groupedCompletedTasks).length > 0 ? Object.entries(groupedCompletedTasks).map(([date, tasksInGroup]) => (
                <div key={date} className="mb-4">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{date}</h3>
                    <ul className="space-y-2">
                        {tasksInGroup.map(task => (
                             <li key={task.id} className="flex items-center justify-between p-2 rounded-md bg-gray-500/5 dark:bg-white/5 group">
                                <div className="flex items-center">
                                    <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-3" />
                                    <span className="text-sm line-through text-gray-500 dark:text-gray-400">{task.text}</span>
                                </div>
                                <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-500/20 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icon name="Trash2" className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )) : <p className="text-center text-sm text-gray-400 py-4">Henüz hiç görev tamamlamadın.</p>}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Tasks;