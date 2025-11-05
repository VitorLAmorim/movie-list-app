import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { FiX, FiUser, FiLogIn } from 'react-icons/fi';
import { useUser } from '../hooks/useUser';
import { toast } from 'react-toastify';

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

const LoginModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Por favor, digite um nome de usuário');
      return;
    }

    setIsLoading(true);

    try {
      await login(username.trim());
      toast.success(`Bem-vindo(a), ${username.trim()}!`);
      onClose();
      setUsername('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setUsername('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} disabled={isLoading}>
          <FiX size={20} />
        </CloseButton>

        <LoginHeader>
          <LoginIcon>
            <FiUser size={40} color="white" />
          </LoginIcon>
          <LoginTitle>Entrar</LoginTitle>
          <LoginSubtitle>
            Crie sua lista de filmes favoritos pessoais
          </LoginSubtitle>
        </LoginHeader>

        <LoginForm onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">Nome de usuário</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome de usuário"
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </InputGroup>

          <LoginButton type="submit" disabled={isLoading || !username.trim()}>
            {isLoading ? (
              'Entrando...'
            ) : (
              <>
                <FiLogIn size={20} />
                Entrar
              </>
            )}
          </LoginButton>
        </LoginForm>

        <InfoMessage>
          💡 Dica: Escolha um nome de usuário único. Ele será usado para salvar e compartilhar sua lista de favoritos.
        </InfoMessage>
      </ModalContent>
    </ModalOverlay>
  );

  return createPortal(modalContent, document.body);
};

export default LoginModal;