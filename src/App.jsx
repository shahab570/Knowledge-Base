import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import SubcategoryView from './pages/SubcategoryView';
import NoteEditor from './pages/NoteEditor';
import Settings from './pages/Settings';
import Landing from './pages/Landing';

function Dashboard() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--color-text-secondary)',
      gap: '1rem'
    }}>
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-bg-secondary)', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
        <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Welcome Back!</h2>
        <p>Select a book from the sidebar to continue your journey.</p>
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <Router>
      <Routes>
        {!user ? (
          /* Guest Routes - Always show Landing if not logged in */
          <Route path="*" element={<Landing />} />
        ) : (
          /* Authenticated Routes */
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subcategory/:subId" element={<SubcategoryView />}>
              <Route path="note/:noteId" element={<NoteEditor />} />
            </Route>
            <Route path="/settings" element={<Settings />} />
            {/* Redirect any unknown routes to dashboard */}
            <Route path="*" element={<Dashboard />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;
