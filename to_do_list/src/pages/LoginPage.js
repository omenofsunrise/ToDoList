import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { keyframes } from '@emotion/react';
import client from '../api/client';
import LoginForm from '../components/Login/LoginForm';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoginPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/projects');
    }
  }, [navigate]);

  const handleLogin = async ({ username, password }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await client.post(
        '/api/Account/login',
        {},
        {
          params: { username, password },
        }
      );

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('authToken', token);
        navigate('/projects');
      }
    } catch (err) {
      setError('Неверный логин или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            padding: { xs: 3, sm: 4 },
            animation: `${fadeIn} 0.5s ease-in-out`,
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <LockOutlinedIcon
            sx={{
              fontSize: { xs: 40, sm: 48 },
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 3,
              fontSize: { xs: '1.75rem', sm: '2rem' },
            }}
          >
            Вход в систему
          </Typography>
          <LoginForm onSubmit={handleLogin} error={error} isLoading={isLoading} />
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;