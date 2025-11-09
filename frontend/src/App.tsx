import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import GlobalStyles from './styles/GlobalStyles';
import theme, { DefaultTheme } from './styles/theme';
import './styled.d.ts';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import SharedListPage from './pages/SharedListPage';

import { UserProvider } from './hooks/useUser';

function App() {
  return (
    <ThemeProvider theme={theme as DefaultTheme}>
      <UserProvider>
        <Router>
          <GlobalStyles />
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/shared/:shareToken" element={<SharedListPage />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;