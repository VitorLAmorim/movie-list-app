import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Spinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
`;

const LoadingSpinner = ({ text = "Carregando..." }) => (
  <LoadingContainer>
    <Spinner />
    <LoadingText>{text}</LoadingText>
  </LoadingContainer>
);

export default LoadingSpinner;