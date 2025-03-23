import React, { useState } from 'react';
import { TextField, Button, Typography, CircularProgress, InputAdornment } from '@mui/material';
import { Person, Lock } from '@mui/icons-material';

const LoginForm = ({ onSubmit, error, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;

    if (!username) {
      setUsernameError('Логин не может быть пустым');
      isValid = false;
    } else {
      setUsernameError('');
    }

    if (!password) {
      setPasswordError('Пароль не может быть пустым');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ username, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <TextField
        label="Логин"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ mb: 2 }}
        error={!!usernameError}
        helperText={usernameError}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person sx={{ color: 'action.active' }} />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Пароль"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
        error={!!passwordError}
        helperText={passwordError}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: 'action.active' }} />
            </InputAdornment>
          ),
        }}
      />
      {error && (
        <Typography
          color="error"
          sx={{
            mb: 2,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isLoading}
        sx={{
          mt: 3,
          py: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
      </Button>
    </form>
  );
};

export default LoginForm;