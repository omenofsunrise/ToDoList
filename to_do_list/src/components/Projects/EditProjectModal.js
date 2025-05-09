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

const EditProjectModal = ({ open, onClose, editingProject, setEditingProject, handleSaveProject }) => {
  const [errors, setErrors] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!editingProject) return null;

  const validateFields = () => {
    const newErrors = {};
    if (!editingProject.nameProject?.trim()) {
      newErrors.nameProject = 'Название проекта обязательно';
    }
    if (!editingProject.description?.trim()) {
      newErrors.description = 'Описание проекта обязательно';
    }
    if (!editingProject.stateProject?.trim()) {
      newErrors.stateProject = 'Статус проекта обязателен';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateFields()) return; 
    handleSaveProject();
  };

  const handleClose = () => {
    setEditingProject(null);
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
          Редактировать проект
        </Typography>

        <TextField
          label="Название проекта"
          fullWidth
          margin="normal"
          value={editingProject.nameProject || ''}
          onChange={(e) =>
            setEditingProject({ ...editingProject, nameProject: e.target.value })
          }
          error={!!errors.nameProject}
          helperText={errors.nameProject}
          sx={{ mb: 2 }}
          InputProps={{
            sx: {
              borderRadius: 2,
              fontSize: isMobile ? '0.9rem' : '1rem',
            },
          }}
        />

        <TextField
          label="Описание"
          fullWidth
          margin="normal"
          value={editingProject.description || ''}
          onChange={(e) =>
            setEditingProject({ ...editingProject, description: e.target.value })
          }
          error={!!errors.description}
          helperText={errors.description}
          sx={{ mb: 2 }}
          InputProps={{
            sx: {
              borderRadius: 2,
              fontSize: isMobile ? '0.9rem' : '1rem',
            },
          }}
        />

        <TextField
          label="Статус проекта"
          fullWidth
          margin="normal"
          value={editingProject.stateProject || ''}
          onChange={(e) =>
            setEditingProject({ ...editingProject, stateProject: e.target.value })
          }
          error={!!errors.stateProject}
          helperText={errors.stateProject}
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

export default EditProjectModal;