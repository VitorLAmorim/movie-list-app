import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiLogOut, FiFilm, FiHeart } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { username, isLoggedIn, logout } = useUser();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border px-4 py-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center gap-4 flex-wrap">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-primary hover:text-white transition-colors duration-200 flex-shrink-0 sm:text-lg sm:gap-1 text-base"
        >
          <FiFilm size={24} className="w-6 h-6" />
          <span className="hidden sm:inline">MovieList</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 md:gap-3 sm:gap-2 order-3 w-full justify-center mt-2 flex-1 justify-center min-w-0">
          <Link
            to="/"
            className="flex items-center gap-1 text-text font-medium px-3 py-2 rounded-small hover:bg-primary hover:text-white transition-all duration-200 whitespace-nowrap sm:px-2 sm:py-1 sm:text-sm sm:gap-1 flex-1 justify-center min-w-0"
          >
            <FiSearch size={18} className="w-4 h-4" />
            <span className="hidden sm:inline">Pesquisar</span>
          </Link>

          {isLoggedIn && (
            <Link
              to="/favorites"
              className="flex items-center gap-1 text-text font-medium px-3 py-2 rounded-small hover:bg-primary hover:text-white transition-all duration-200 whitespace-nowrap sm:px-2 sm:py-1 sm:text-sm sm:gap-1 flex-1 justify-center min-w-0"
            >
              <FiHeart size={18} className="w-4 h-4" />
              <span className="hidden sm:inline">Favoritos</span>
            </Link>
          )}
        </nav>

        {/* Search - Hidden on tablet, visible on desktop */}
        <div className="flex-1 max-w-md relative order-2 hidden md:block sm:max-w-xs">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar filmes..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-background border border-border rounded-large text-text text-sm focus:outline-none focus:border-primary"
            />
            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4"
            />
          </form>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-3 md:gap-2 sm:gap-2 order-1 flex-shrink-0">
          {isLoggedIn ? (
            <>
              <span className="text-textSecondary text-sm hidden md:block">
                Olá, {username}
              </span>
              <button
                onClick={handleLogout}
                title="Sair"
                className="bg-transparent text-textSecondary p-2 rounded-small hover:text-error hover:bg-background transition-all duration-200 min-h-10 sm:p-1 sm:min-h-9"
              >
                <FiLogOut size={20} className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/?login=true')}
              className="bg-primary text-white px-4 py-2 rounded-small font-medium flex items-center gap-1 hover:bg-red-600 transition-all duration-200 whitespace-nowrap min-h-10 sm:px-3 sm:py-1 sm:text-sm"
            >
              <FiUser size={18} className="w-4 h-4" />
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;