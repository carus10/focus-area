import React from 'react';
import PomodoroWidget from '../components/PomodoroWidget.tsx';
import MusicWidget from '../components/MusicWidget.tsx';
import MotivationWidget from '../components/MotivationWidget.tsx';
import InfoWidget from '../components/InfoWidget.tsx';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-400 dark:to-violet-300">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PomodoroWidget />
        </div>
        <div className="lg:col-span-2 grid grid-rows-2 gap-6">
            <div className="row-span-1">
                <MusicWidget />
            </div>
            <div className="row-span-1">
                <MotivationWidget />
            </div>
        </div>
      </div>
      <InfoWidget />
    </div>
  );
};

export default Dashboard;