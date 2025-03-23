import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Modal, useMediaQuery, useTheme, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import client from '../../api/client';
import { keyframes } from '@emotion/react';

const AddStakeModal = ({ open, onClose, onStakeCreated }) => {
  const [newStake, setNewStake] = useState({
    nameStake: '',
    abNameStake: '',
  });

  const [errors, setErrors] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fadeIn = keyframes`
    from {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  `;

  const validateFields = () => {
    const newErrors = {};
    if (!newStake.nameStake.trim()) {
      newErrors.nameStake = 'Название стейкхолдера обязательно';
    }
    if (!newStake.abNameStake.trim()) {
      newErrors.abNameStake = 'Аббревиатура стейкхолдера обязательна';
    } else if (newStake.abNameStake.length > 5) {
      newErrors.abNameStake = 'Аббревиатура должна быть не более 5 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateStake = async () => {
    if (!validateFields()) return;

    try {
      const response = await client.post('/api/Stake', newStake, {
        headers: {
          'Content-Type': 'application/json',
          Auth: localStorage.getItem('authToken'),
        },
      });

      if (response.status === 200) {
        onStakeCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Ошибка при создании стейкхолдера:', error);
    }
  };

  const handleClose = () => {
    setNewStake({ nameStake: '', abNameStake: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '90%' : 400,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          p: isMobile ? 2 : 4,
          animation: `${fadeIn} 0.3s ease-in-out`,
          background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
        }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 3,
            textAlign: 'center',
            fontSize: isMobile ? '1.5rem' : '2rem',
          }}
        >
          Добавить стекхолдера
        </Typography>

        <TextField
          label="Имя"
          fullWidth
          margin="normal"
          value={newStake.nameStake}
          onChange={(e) => setNewStake({ ...newStake, nameStake: e.target.value })}
          error={!!errors.nameStake}
          helperText={errors.nameStake}
          sx={{ mb: 2 }}
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
          value={newStake.abNameStake}
          onChange={(e) => setNewStake({ ...newStake, abNameStake: e.target.value })}
          error={!!errors.abNameStake}
          helperText={errors.abNameStake}
          sx={{ mb: 3 }}
          InputProps={{
            sx: {
              borderRadius: 2,
              fontSize: isMobile ? '0.9rem' : '1rem',
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleCreateStake}
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
            Создать
          </Button>
          <Button
            variant="outlined"
            onClick={handleClose}
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
    </Modal>
  );
};

export default AddStakeModal;