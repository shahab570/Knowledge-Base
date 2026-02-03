import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import MainLayout from './components/Layout/MainLayout';
import SubcategoryView from './pages/SubcategoryView';
import NoteEditor from './pages/NoteEditor';
import Settings from './pages/Settings';

function Dashboard() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--text-dim)',
      fontSize: '1.1rem'
    }}>
      Select a book from the sidebar to start.
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />

              <Route path="subcategory/:subId" element={<SubcategoryView />}>
                <Route path="note/:noteId" element={<NoteEditor />} />
              </Route>

              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
