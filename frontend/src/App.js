import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import './styles/App.css';

/**
 * Main App Component
 * Handles authentication state and renders appropriate components
 */
function AppContent() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login if user is not authenticated
  if (!user) {
    return <Login />;
  }

  // Show dashboard if user is authenticated
  return (
    <TaskProvider>
      <Dashboard />
    </TaskProvider>
  );
}

/**
 * Root App Component with Providers
 */
function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;