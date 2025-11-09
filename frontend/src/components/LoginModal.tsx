import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FiX, FiUser, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 400px;
  width: 100%;
  position: relative;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LoginIcon = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
`;

const LoginTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const LoginSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(229, 9, 20, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const InfoMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-top: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : 'transparent'
  };
  color: ${({ theme, $isActive }) =>
    $isActive ? 'white' : theme.colors.textSecondary
  };
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.surface
    };
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ErrorCloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

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
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} disabled={isLoading}>
          <FiX size={20} />
        </CloseButton>

        <LoginHeader>
          <LoginIcon>
            <FiUser size={40} color="white" />
          </LoginIcon>
          <LoginTitle>
            {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
          </LoginTitle>
          <LoginSubtitle>
            {activeTab === 'login'
              ? 'Acesse sua lista de filmes favoritos'
              : 'Crie sua lista de filmes favoritos pessoais'
            }
          </LoginSubtitle>
        </LoginHeader>

        <TabContainer>
          <TabButton
            type="button"
            $isActive={activeTab === 'login'}
            onClick={() => switchTab('login')}
            disabled={isLoading}
          >
            Entrar
          </TabButton>
          <TabButton
            type="button"
            $isActive={activeTab === 'register'}
            onClick={() => switchTab('register')}
            disabled={isLoading}
          >
            Criar Conta
          </TabButton>
        </TabContainer>

        {error && (
          <ErrorMessage>
            {error}
            <ErrorCloseButton onClick={() => setError('')}>×</ErrorCloseButton>
          </ErrorMessage>
        )}

        <LoginForm onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">Nome de usuário</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="Digite seu nome de usuário"
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder={activeTab === 'login' ? 'Digite sua senha' : 'Crie uma senha'}
              autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
              required
              disabled={isLoading}
            />
          </InputGroup>

          {activeTab === 'register' && (
            <InputGroup>
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
                required
                disabled={isLoading}
              />
            </InputGroup>
          )}

          <LoginButton
            type="submit"
            disabled={isLoading || !username.trim() || (activeTab === 'register' && (!password || password !== confirmPassword))}
          >
            {isLoading ? (
              activeTab === 'login' ? 'Entrando...' : 'Criando...'
            ) : (
              <>
                {activeTab === 'login' ? <FiLogIn size={20} /> : <FiUserPlus size={20} />}
                {activeTab === 'login' ? 'Entrar' : 'Criar Conta'}
              </>
            )}
          </LoginButton>
        </LoginForm>

        <InfoMessage>
          {activeTab === 'login' ? (
            <>
              💡 Dica: Se ainda não tem uma conta, clique em "Criar Conta" para se registrar.
            </>
          ) : (
            <>
              💡 Dica: Escolha um nome de usuário único e uma senha segura (mínimo 6 caracteres).
            </>
          )}
        </InfoMessage>
      </ModalContent>
    </ModalOverlay>
  );

  return createPortal(modalContent, document.body);
};

export default LoginModal;