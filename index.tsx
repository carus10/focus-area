
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { DataProvider, PomodoroProvider } from './context/DataContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DataProvider>
      <PomodoroProvider>
        <App />
      </PomodoroProvider>
    </DataProvider>
  </React.StrictMode>
);
