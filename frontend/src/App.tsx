import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import SharedListPage from './pages/SharedListPage';

import { UserProvider } from './hooks/useUser';

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-background text-text">
        <Header />
        <main className="min-h-[calc(100vh-80px)] p-6 md:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/shared/:shareToken" element={<SharedListPage />} />
          </Routes>
        </main>
      </div>
    </UserProvider>
  );
}

export default App;