import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  useMediaQuery,
  useTheme,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { keyframes } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';

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

const AddTaskModal = ({ open, onClose, addingTask, setAddingTask, handleAddTask }) => {
  const [errors, setErrors] = useState({});
  const [responsibleUsers, setResponsibleUsers] = useState([]);
  const [observerUsers, setObserverUsers] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: existingUsers = [] } = useQuery({
    queryKey: ['existingUsers'],
    queryFn: async () => {
      const response = await client.get('/api/User');
      return response.data;
    },
  });

  const validateFields = () => {
    const newErrors = {};
    if (!addingTask?.nameTask?.trim()) {
      newErrors.nameTask = 'Название задачи обязательно';
    }
    if (!addingTask?.deadLine) {
      newErrors.deadLine = 'Дедлайн задачи обязателен';
    }
    if (responsibleUsers.length === 0 && observerUsers.length === 0) {
      newErrors.users = 'Выберите хотя бы одного пользователя';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTaskClick = () => {
    if (!validateFields()) return;

    const userRoles = [
      ...responsibleUsers.map((user) => ({ userId: user.idUser, role: 1 })),
      ...observerUsers.map((user) => ({ userId: user.idUser, role: 0 })),
    ];

    const taskPayload = {
      ...addingTask,
      userRoles,
    };

    handleAddTask(taskPayload);
  };

  const handleClose = () => {
    setAddingTask({ nameTask: '', description: '', deadLine: '' });
    setResponsibleUsers([]);
    setObserverUsers([]);
    setErrors({});
    onClose();
  };

  const handleResponsibleUsersChange = (selectedUsers) => {
    const newObserverUsers = observerUsers.filter(
      (user) => !selectedUsers.some((selectedUser) => selectedUser.idUser === user.idUser)
    );
    setResponsibleUsers(selectedUsers);
    setObserverUsers(newObserverUsers);
  };

  const handleObserverUsersChange = (selectedUsers) => {
    const newResponsibleUsers = responsibleUsers.filter(
      (user) => !selectedUsers.some((selectedUser) => selectedUser.idUser === user.idUser)
    );
    setObserverUsers(selectedUsers);
    setResponsibleUsers(newResponsibleUsers);
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
          Добавить задачу
        </Typography>

        <TextField
          label="Название задачи"
          fullWidth
          margin="normal"
          value={addingTask?.nameTask || ''}
          onChange={(e) =>
            setAddingTask({ ...addingTask, nameTask: e.target.value })
          }
          error={!!errors.nameTask}
          helperText={errors.nameTask}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Описание"
          fullWidth
          margin="normal"
          value={addingTask?.description || ''}
          onChange={(e) =>
            setAddingTask({ ...addingTask, description: e.target.value })
          }
          sx={{ mb: 2 }}
        />

        <TextField
          label="Дедлайн"
          type="datetime-local"
          fullWidth
          margin="normal"
          value={addingTask?.deadLine || ''}
          onChange={(e) =>
            setAddingTask({ ...addingTask, deadLine: e.target.value })
          }
          error={!!errors.deadLine}
          helperText={errors.deadLine}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" component="h3" gutterBottom>
          Ответственные за задачу
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Ответственные</InputLabel>
          <Select
            multiple
            value={responsibleUsers}
            onChange={(e) => handleResponsibleUsersChange(e.target.value)}
            renderValue={(selected) => selected.map((user) => user.username).join(', ')}
          >
            {existingUsers.map((user) => (
              <MenuItem key={user.idUser} value={user}>
                <Checkbox checked={responsibleUsers.some((u) => u.idUser === user.idUser)} />
                <ListItemText primary={user.username} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" component="h3" gutterBottom>
          Наблюдатели за задачу
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Наблюдатели</InputLabel>
          <Select
            multiple
            value={observerUsers}
            onChange={(e) => handleObserverUsersChange(e.target.value)}
            renderValue={(selected) => selected.map((user) => user.username).join(', ')}
          >
            {existingUsers.map((user) => (
              <MenuItem key={user.idUser} value={user}>
                <Checkbox checked={observerUsers.some((u) => u.idUser === user.idUser)} />
                <ListItemText primary={user.username} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddTaskClick}
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
            Добавить
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

export default AddTaskModal;