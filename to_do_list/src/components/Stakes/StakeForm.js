import React, { useState } from 'react';
import { TextField, Button, Box, Typography, useTheme, useMediaQuery } from '@mui/material';

const StakeForm = ({ initialData, onSubmit, onCancel }) => {
  const [stakeData, setStakeData] = useState(initialData || { nameStake: '', abNameStake: '' });
  const [errors, setErrors] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const validateFields = () => {
    const newErrors = {};
    if (!stakeData.nameStake.trim()) {
      newErrors.nameStake = 'Название Stake обязательно';
    }
    if (!stakeData.abNameStake.trim()) {
      newErrors.abNameStake = 'Аббревиатура обязательна';
    } else if (stakeData.abNameStake.length > 5) {
      newErrors.abNameStake = 'Аббревиатура должна быть не более 5 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    onSubmit(stakeData);
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
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >

      <TextField
        label="Имя"
        fullWidth
        margin="normal"
        value={stakeData.nameStake}
        onChange={(e) => setStakeData({ ...stakeData, nameStake: e.target.value })}
        error={!!errors.nameStake}
        helperText={errors.nameStake}
        InputProps={{
          sx: {
            borderRadius: 2,
            fontSize: isMobile ? '0.9rem' : '1rem',
          },
        }}
      />

      <TextField
        label="Аббревиатура"
        fullWidth
        margin="normal"
        value={stakeData.abNameStake}
        onChange={(e) => setStakeData({ ...stakeData, abNameStake: e.target.value })}
        error={!!errors.abNameStake}
        helperText={errors.abNameStake}
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

export default StakeForm;