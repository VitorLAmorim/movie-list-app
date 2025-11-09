import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiUser, FiLogOut, FiFilm, FiHeart } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm};
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.sm};
    flex-wrap: wrap;
  }

  @media (max-width: 380px) {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.2rem;
    gap: ${({ theme }) => theme.spacing.xs};
    flex-shrink: 0;
  }

  @media (max-width: 380px) {
    font-size: 1rem;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: ${({ theme }) => theme.spacing.md};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.sm};
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: 0.9rem;
    gap: ${({ theme }) => theme.spacing.xs};
    flex: 1;
    justify-content: center;
    min-width: 0;
  }

  .search-text {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  position: relative;
  order: 2;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    order: 2;
    max-width: 200px;
  }

  @media (max-width: 380px) {
    max-width: 150px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  padding-left: 2.5rem;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  order: 3;
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    gap: ${({ theme }) => theme.spacing.sm};
    order: 1;
  }

  @media (max-width: 380px) {
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const UserGreeting = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const LoginButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;
  min-height: 40px;

  &:hover {
    background-color: #f40612;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    font-size: 0.9rem;
    min-height: 36px;
  }

  @media (max-width: 380px) {
    font-size: 0.8rem;
    padding: ${({ theme }) => theme.spacing.xs};
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  display: flex;
  align-items: center;
  min-height: 40px;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background-color: ${({ theme }) => theme.colors.background};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.xs};
    min-height: 36px;
  }
`;

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
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <FiFilm size={24} />
          MovieList
        </Logo>

        <Navigation>
          <NavLink to="/">
            <FiSearch size={18} />
            <span className="search-text">
              Pesquisar
            </span>
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/favorites">
              <FiHeart size={18} />
              Favoritos
            </NavLink>
          )}
        </Navigation>

        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Buscar filmes..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            <SearchIcon size={18} />
          </form>
        </SearchContainer>

        <UserSection>
          {isLoggedIn ? (
            <>
              <UserGreeting>Olá, {username}</UserGreeting>
              <LogoutButton onClick={handleLogout} title="Sair">
                <FiLogOut size={20} />
              </LogoutButton>
            </>
          ) : (
            <LoginButton onClick={() => navigate('/?login=true')}>
              <FiUser size={18} />
              Entrar
            </LoginButton>
          )}
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;