import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import client from '../../api/client';
import { useQuery } from '@tanstack/react-query';
import { keyframes } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';

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

const AddProjectForm = ({ onSubmit, onCancel, onClose }) => {
  const [projectData, setProjectData] = useState({
    nameProject: '',
    description: '',
    stateProject: '',
    startDate: new Date().toISOString().slice(0, 16),
  });

  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedStakes, setSelectedStakes] = useState([]);
  const [responsibleUsers, setResponsibleUsers] = useState([]);
  const [observerUsers, setObserverUsers] = useState([]); 
  const [tasksData, setTasksData] = useState([]); 
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleTaskResponsibleUsersChange = (index, selectedUsers) => {
    const newTasksData = [...tasksData];
    newTasksData[index].responsibleUsers = selectedUsers;
    newTasksData[index].observerUsers = newTasksData[index].observerUsers.filter(
      (user) => !selectedUsers.some((selectedUser) => selectedUser.idUser === user.idUser)
    );
    setTasksData(newTasksData);
  };
  
  const handleTaskObserverUsersChange = (index, selectedUsers) => {
    const newTasksData = [...tasksData];
    newTasksData[index].observerUsers = selectedUsers;
    newTasksData[index].responsibleUsers = newTasksData[index].responsibleUsers.filter(
      (user) => !selectedUsers.some((selectedUser) => selectedUser.idUser === user.idUser)
    );
    setTasksData(newTasksData);
  };

  const { data: existingGoals = [] } = useQuery({
    queryKey: ['existingGoals'],
    queryFn: async () => {
      const response = await client.get('/api/Goal');
      return response.data;
    },
  });

  const { data: existingStakes = [] } = useQuery({
    queryKey: ['existingStakes'],
    queryFn: async () => {
      const response = await client.get('/api/Stake');
      return response.data;
    },
  });

  const { data: existingUsers = [] } = useQuery({
    queryKey: ['existingUsers'],
    queryFn: async () => {
      const response = await client.get('/api/User');
      return response.data;
    },
  });

  const validateForm = () => {
    const newErrors = {};

    const projectUserRoles = [...responsibleUsers, ...observerUsers];
    const hasDuplicateUsers = projectUserRoles.some(
    (user, index) => projectUserRoles.findIndex((u) => u.idUser === user.idUser) !== index
  );
  if (hasDuplicateUsers) {
    newErrors.userRoles = 'Один и тот же пользователь не может быть одновременно ответственным и наблюдателем';
  }
  tasksData.forEach((task, index) => {
    const taskUserRoles = [...task.responsibleUsers, ...task.observerUsers];
    const hasDuplicateTaskUsers = taskUserRoles.some(
      (user, idx) => taskUserRoles.findIndex((u) => u.idUser === user.idUser) !== idx
    );
    if (hasDuplicateTaskUsers) {
      newErrors[`taskUsers${index}`] = 'Один и тот же пользователь не может быть одновременно ответственным и наблюдателем для задачи';
    }
  });
    if (!projectData.nameProject.trim()) {
      newErrors.nameProject = 'Название проекта обязательно';
    }
    if (!projectData.description.trim()) {
      newErrors.description = 'Описание проекта обязательно';
    }
    if (!projectData.stateProject.trim()) {
      newErrors.stateProject = 'Статус проекта обязателен';
    }
    if (selectedGoals.length === 0) {
      newErrors.goals = 'Выберите хотя бы одну цель';
    }
    if (selectedStakes.length === 0) {
      newErrors.stakes = 'Выберите хотя бы одного стейкхолдера';
    }
    tasksData.forEach((task, index) => {
      if (!task.nameTask.trim()) {
        newErrors[`taskName${index}`] = 'Название задачи обязательно';
      }
      if (!task.deadLine) {
        newErrors[`taskDeadline${index}`] = 'Дедлайн задачи обязателен';
      }
      if (task.responsibleUsers.length === 0 && task.observerUsers.length === 0) {
        newErrors[`taskUsers${index}`] = 'Выберите хотя бы одного пользователя для задачи';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const projectPayload = {
      ...projectData,
      UserRoles: [
        ...responsibleUsers.map(user => ({ UserId: user.idUser, Role: 1 })),
        ...observerUsers.map(user => ({ UserId: user.idUser, Role: 0 })),
      ],
      goalIds: selectedGoals,
      stakeholderIds: selectedStakes,
      tasks: tasksData.map((task) => ({
        ...task,
        UserRoles: [
          ...task.responsibleUsers.map(user => ({ UserId: user.idUser, Role: 1 })),
          ...task.observerUsers.map(user => ({ UserId: user.idUser, Role: 0 })),
        ],
      })),
    };

    onSubmit(projectPayload, selectedStakes, selectedGoals, responsibleUsers, observerUsers, tasksData);
  };

  const handleCancel = () => {
    setProjectData({
      nameProject: '',
      description: '',
      stateProject: '',
      startDate: new Date().toISOString().slice(0, 16),
    });
    setSelectedGoals([]);
    setSelectedStakes([]);
    setResponsibleUsers([]);
    setObserverUsers([]);
    setTasksData([]);
    setErrors({});
    onClose();
  };

  const handleDeleteTask = (index) => {
    const newTasksData = tasksData.filter((_, i) => i !== index);
    setTasksData(newTasksData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        animation: `${fadeIn} 0.3s ease-in-out`,
        background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        p: isMobile ? 2 : 4,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <TextField
        label="Название проекта"
        fullWidth
        margin="normal"
        value={projectData.nameProject}
        onChange={(e) => setProjectData({ ...projectData, nameProject: e.target.value })}
        error={!!errors.nameProject}
        helperText={errors.nameProject}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Описание проекта"
        fullWidth
        margin="normal"
        value={projectData.description}
        onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
        error={!!errors.description}
        helperText={errors.description}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Статус проекта"
        fullWidth
        margin="normal"
        value={projectData.stateProject}
        onChange={(e) => setProjectData({ ...projectData, stateProject: e.target.value })}
        error={!!errors.stateProject}
        helperText={errors.stateProject}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Дата начала"
        type="datetime-local"
        fullWidth
        margin="normal"
        value={projectData.startDate}
        onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />

      <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2 }}>
        Выбор целей
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.goals}>
        <InputLabel>Цели</InputLabel>
        <Select
          multiple
          value={selectedGoals}
          onChange={(e) => setSelectedGoals(e.target.value)}
          renderValue={(selected) =>
            selected
              .map((id) => existingGoals.find((goal) => goal.idGoal === id)?.nameGoal)
              .filter((name) => name)
              .join(', ')
          }
        >
          {existingGoals.map((goal) => (
            <MenuItem key={goal.idGoal} value={goal.idGoal}>
              {goal.nameGoal}
            </MenuItem>
          ))}
        </Select>
        {errors.goals && <Typography variant="caption" color="error">{errors.goals}</Typography>}
      </FormControl>

      <Typography variant="h6" component="h3" gutterBottom>
        Выбор стейкхолдеров
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.stakes}>
        <InputLabel>Стейкхолдеры</InputLabel>
        <Select
          multiple
          value={selectedStakes}
          onChange={(e) => setSelectedStakes(e.target.value)}
          renderValue={(selected) =>
            selected
              .map((id) => existingStakes.find((stake) => stake.idStake === id)?.nameStake)
              .filter((name) => name)
              .join(', ')
          }
        >
          {existingStakes.map((stake) => (
            <MenuItem key={stake.idStake} value={stake.idStake}>
              {stake.nameStake}
            </MenuItem>
          ))}
        </Select>
        {errors.stakes && <Typography variant="caption" color="error">{errors.stakes}</Typography>}
      </FormControl>

      <Typography variant="h6" component="h3" gutterBottom>
        Ответственные за проект
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

      <Typography variant="h6" component="h3" gutterBottom>
        Задачи
      </Typography>
      {tasksData.map((task, index) => (
        <Paper key={index} sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Название задачи"
                fullWidth
                margin="normal"
                value={task.nameTask}
                onChange={(e) => {
                  const newTasksData = [...tasksData];
                  newTasksData[index].nameTask = e.target.value;
                  setTasksData(newTasksData);
                }}
                error={!!errors[`taskName${index}`]}
                helperText={errors[`taskName${index}`]}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Описание задачи"
                fullWidth
                margin="normal"
                value={task.description}
                onChange={(e) => {
                  const newTasksData = [...tasksData];
                  newTasksData[index].description = e.target.value;
                  setTasksData(newTasksData);
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Дедлайн"
                type="datetime-local"
                fullWidth
                margin="normal"
                value={task.deadLine}
                onChange={(e) => {
                  const newTasksData = [...tasksData];
                  newTasksData[index].deadLine = e.target.value;
                  setTasksData(newTasksData);
                }}
                error={!!errors[`taskDeadline${index}`]}
                helperText={errors[`taskDeadline${index}`]}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle1" gutterBottom>
                Ответственные за задачу
              </Typography>
              <FormControl fullWidth margin="normal">
  <InputLabel>Ответственные</InputLabel>
  <Select
    multiple
    value={task.responsibleUsers || []}
    onChange={(e) => handleTaskResponsibleUsersChange(index, e.target.value)}
    renderValue={(selected) => selected.map((user) => user.username).join(', ')}
  >
    {existingUsers.map((user) => (
      <MenuItem key={user.idUser} value={user}>
        <Checkbox checked={task.responsibleUsers.some((u) => u.idUser === user.idUser)} />
        <ListItemText primary={user.username} />
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl fullWidth margin="normal">
  <InputLabel>Наблюдатели</InputLabel>
  <Select
    multiple
    value={task.observerUsers || []}
    onChange={(e) => handleTaskObserverUsersChange(index, e.target.value)}
    renderValue={(selected) => selected.map((user) => user.username).join(', ')}
  >
    {existingUsers.map((user) => (
      <MenuItem key={user.idUser} value={user}>
        <Checkbox checked={task.observerUsers.some((u) => u.idUser === user.idUser)} />
        <ListItemText primary={user.username} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
            </Box>
            <IconButton onClick={() => handleDeleteTask(index)} sx={{ ml: 2 }}>
              <Delete />
            </IconButton>
          </Box>
        </Paper>
      ))}

      <Button
        variant="outlined"
        onClick={() =>
          setTasksData([
            ...tasksData,
            {
              nameTask: '',
              description: '',
              deadLine: new Date().toISOString().slice(0, 16),
              status: false,
              responsibleUsers: [],
              observerUsers: [],
            },
          ])
        }
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Добавить задачу
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 2,
            fontSize: '1rem',
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
          size="large"
          onClick={handleCancel}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 2,
            fontSize: '1rem',
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

export default AddProjectForm;