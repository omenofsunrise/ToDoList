import React, { useState } from 'react';
import { TextField, Button, Box, useTheme, useMediaQuery } from '@mui/material';

const UserForm = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const [userData, setUserData] = useState(initialData || { username: '', name: '', surname: '', password: '' });
  const [errors, setErrors] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateFields = () => {
    const newErrors = {};
    if (!userData.username.trim()) {
      newErrors.username = 'Логин обязателен';
    }
    if (!userData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }
    if (!userData.surname.trim()) {
      newErrors.surname = 'Фамилия обязательна';
    }
    if (!isEditing && !userData.password.trim()) {
      newErrors.password = 'Пароль обязателен';
    } else if (!isEditing && userData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    onSubmit(userData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: isMobile ? 2 : 3,
      }}
    >
      <TextField
        label="Логин"
        fullWidth
        margin="normal"
        value={userData.username}
        onChange={(e) => setUserData({ ...userData, username: e.target.value })}
        error={!!errors.username}
        helperText={errors.username}
        InputProps={{
          sx: {
            borderRadius: 2,
            fontSize: isMobile ? '0.9rem' : '1rem',
          },
        }}
      />
      <TextField
        label="Имя"
        fullWidth
        margin="normal"
        value={userData.name}
        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        error={!!errors.name}
        helperText={errors.name}
        InputProps={{
          sx: {
            borderRadius: 2,
            fontSize: isMobile ? '0.9rem' : '1rem',
          },
        }}
      />
      <TextField
        label="Фамилия"
        fullWidth
        margin="normal"
        value={userData.surname}
        onChange={(e) => setUserData({ ...userData, surname: e.target.value })}
        error={!!errors.surname}
        helperText={errors.surname}
        InputProps={{
          sx: {
            borderRadius: 2,
            fontSize: isMobile ? '0.9rem' : '1rem',
          },
        }}
      />
      {!isEditing && (
        <TextField
          label="Пароль"
          fullWidth
          margin="normal"
          type="password"
          value={userData.password}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            sx: {
              borderRadius: 2,
              fontSize: isMobile ? '0.9rem' : '1rem',
            },
          }}
        />
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: 2,
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Сохранить
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: 2,
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: 'bold',
            color: 'text.secondary',
            borderColor: 'text.secondary',
            '&:hover': {
              borderColor: 'text.primary',
              color: 'text.primary',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Отмена
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;