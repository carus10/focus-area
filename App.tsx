
import React, { useState, useContext } from 'react';
import { Page, ExternalLink } from './types.ts';
import Dashboard from './pages/Dashboard.tsx';
import Notes from './pages/Notes.tsx';
import Lessons from './pages/Lessons.tsx';
import MusicPlaylists from './pages/MusicPlaylists.tsx';
import Sidebar from './components/Sidebar.tsx';
import { DataContext, PomodoroContext } from './context/DataContext.tsx';
import Settings from './pages/Settings.tsx';
import Exercise from './pages/Exercise.tsx';
import Tasks from './pages/Tasks.tsx';
import Collection from './pages/Collection.tsx';

const externalLinks: ExternalLink[] = [
  { name: 'Notebook', url: 'https://www.onenote.com', icon: 'BookOpen' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: 'Youtube' },
  { name: 'Notion', url: 'https://www.notion.so', icon: 'FileText' },
  { name: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: 'FileText' },
  { name: 'AI Studio', url: 'https://aistudio.google.com/', icon: 'Sparkles' },
];

export default function App() {
  const { theme, backgroundStyle, activePage, setActivePage } = useContext(DataContext);
  const { isFlowModeActive } = useContext(PomodoroContext);

  const renderPage = () => {
    switch (activePage) {
      case Page.Dashboard:
        return <Dashboard />;
      case Page.Tasks:
        return <Tasks />;
      case Page.Exercise:
        return <Exercise />;
      case Page.Notes:
        return <Notes />;
      case Page.Lessons:
        return <Lessons />;
      case Page.MusicPlaylists:
        return <MusicPlaylists />;
      case Page.Collection:
        return <Collection />;
      case Page.Settings:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`${theme} font-sans`}>
      <div 
        className="fixed inset-0 transition-all duration-500 z-[-2]" 
        style={backgroundStyle}
      >
      </div>
       <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40 dark:from-black/40 dark:to-black/60 z-[-1]"></div>
      
       {isFlowModeActive && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[60] flex items-center justify-center animate-fade-in"
        >
          <h1 
            className="text-6xl font-bold text-white animate-glow-text-flow"
            style={{ '--glow-color': '#FFFFFF' } as React.CSSProperties}
          >
            Akıştasın.
          </h1>
        </div>
      )}

      <div className="flex h-screen text-gray-800 dark:text-gray-200">
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage}
          externalLinks={externalLinks}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}