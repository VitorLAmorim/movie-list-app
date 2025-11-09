import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiUser, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Por favor, digite um nome de usuário');
      return;
    }

    if (activeTab === 'register') {
      if (!password) {
        setError('Por favor, digite uma senha');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const response = await authAPI.login(username.trim(), password);
        const { user, needsPassword } = response.data;

        await login(user.username);
        toast.success(`Bem-vindo(a), ${user.username}!`);

        if (needsPassword) {
          toast.info('Recomendamos definir uma senha para sua conta');
        }
      } else {
        await authAPI.register(username.trim(), password);
        await login(username.trim());
        toast.success(`Conta criada com sucesso! Bem-vindo(a), ${username.trim()}!`);
      }

      onClose();
      resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    resetForm();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6" onClick={handleClose}>
      <div className="bg-surface rounded-large p-8 max-w-md w-full relative sm:p-6" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 bg-transparent text-textSecondary border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-background hover:text-text disabled:cursor-not-allowed"
        >
          <FiX size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-primary to-accent w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiUser size={40} color="white" />
          </div>
          <h2 className="text-[1.8rem] font-semibold text-text mb-2">
            {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
          </h2>
          <p className="text-textSecondary text-base">
            {activeTab === 'login'
              ? 'Acesse sua lista de filmes favoritos'
              : 'Crie sua lista de filmes favoritos pessoais'
            }
          </p>
        </div>

        <div className="flex gap-2 mb-8 bg-background p-2 rounded-medium">
          <button
            type="button"
            onClick={() => switchTab('login')}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-small font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'login'
                ? 'bg-primary text-white'
                : 'bg-transparent text-textSecondary hover:bg-surface'
            } disabled:cursor-not-allowed`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-small font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'register'
                ? 'bg-primary text-white'
                : 'bg-transparent text-textSecondary hover:bg-surface'
            } disabled:cursor-not-allowed`}
          >
            Criar Conta
          </button>
        </div>

        {error && (
          <div className="bg-error text-white px-4 py-3 rounded-small mb-6 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="bg-none border-none text-white cursor-pointer text-lg p-0 ml-2">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-text font-medium text-sm">
              Nome de usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="Digite seu nome de usuário"
              autoComplete="username"
              required
              disabled={isLoading}
              className="py-3 bg-background border-2 border-border rounded-medium text-text text-base transition-all duration-200 focus:border-primary focus:outline-none placeholder:text-textSecondary disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-text font-medium text-sm">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder={activeTab === 'login' ? 'Digite sua senha' : 'Crie uma senha'}
              autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
              required
              disabled={isLoading}
              className="py-3 bg-background border-2 border-border rounded-medium text-text text-base transition-all duration-200 focus:border-primary focus:outline-none placeholder:text-textSecondary disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {activeTab === 'register' && (
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-text font-medium text-sm">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
                required
                disabled={isLoading}
                className="py-3 bg-background border-2 border-border rounded-medium text-text text-base transition-all duration-200 focus:border-primary focus:outline-none placeholder:text-textSecondary disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim() || (activeTab === 'register' && (!password || password !== confirmPassword))}
            className="bg-gradient-to-br from-primary to-accent text-white py-4 border-none rounded-medium text-[1.1rem] font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:transform hover:translate-y-[-2px] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              activeTab === 'login' ? 'Entrando...' : 'Criando...'
            ) : (
              <>
                {activeTab === 'login' ? <FiLogIn size={20} /> : <FiUserPlus size={20} />}
                {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
              </>
            )}
          </button>
        </form>

        <div className="bg-background border-l-4 border-primary px-4 py-3 rounded-small mt-6 text-textSecondary text-sm">
          {activeTab === 'login' ? (
            <>
              💡 Dica: Se ainda não tem uma conta, clique em "Criar Conta" para se registrar.
            </>
          ) : (
            <>
              💡 Dica: Escolha um nome de usuário único e uma senha segura (mínimo 6 caracteres).
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LoginModal;