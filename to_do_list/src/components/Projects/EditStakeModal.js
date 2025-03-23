import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Modal, useMediaQuery, useTheme, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { keyframes } from '@emotion/react';

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

const EditStakeModal = ({ open, onClose, editingStake, setEditingStake, updateStakeMutation }) => {
  const [errors, setErrors] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!editingStake) return null;

  const validateFields = () => {
    const newErrors = {};
    if (!editingStake.nameStake?.trim()) {
      newErrors.nameStake = 'Название Stake обязательно';
    }
    if (!editingStake.abNameStake?.trim()) {
      newErrors.abNameStake = 'Аббревиатура Stake обязательна';
    } else if (editingStake.abNameStake.length > 5) {
      newErrors.abNameStake = 'Аббревиатура должна быть не более 5 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateFields()) return;
    updateStakeMutation.mutate(editingStake); 
    onClose();
  };

  const handleClose = () => {
    setEditingStake(null); 
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
        }}
      >
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
          Редактировать Stake
        </Typography>

        <TextField
          label="Название Stake"
          fullWidth
          margin="normal"
          value={editingStake.nameStake || ''}
          onChange={(e) =>
            setEditingStake({ ...editingStake, nameStake: e.target.value })
          }
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
          value={editingStake.abNameStake || ''}
          onChange={(e) =>
            setEditingStake({ ...editingStake, abNameStake: e.target.value })
          }
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
            onClick={handleSave}
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

export default EditStakeModal;