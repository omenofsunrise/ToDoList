import React, { useState } from 'react';
import { TextField, Button, Box, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';

const ChangePasswordForm = ({ onSubmit, onCancel }) => {
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateFields = () => {
    const newErrors = {};
    if (!newPassword.trim()) {
      newErrors.newPassword = 'Новый пароль обязателен';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Пароль должен быть не менее 6 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    onSubmit(newPassword);
    setIsPasswordChanged(true);
  };

  const handleCloseSnackbar = () => {
    setIsPasswordChanged(false);
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
        label="Новый пароль"
        fullWidth
        margin="normal"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        InputProps={{
          sx: {
            borderRadius: 2,
            fontSize: isMobile ? '0.9rem' : '1rem',
          },
        }}
      />
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
          Сменить пароль
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

export default ChangePasswordForm;