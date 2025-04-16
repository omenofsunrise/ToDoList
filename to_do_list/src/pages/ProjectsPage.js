import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Typography,
  List,
  ListItem,
  Collapse,
  IconButton,
  CircularProgress,
  Box,
  Switch,
  LinearProgress,
  ListItemText,
  Modal,
  Button,
  Divider,
  Paper,
  Container,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { ExpandMore, ExpandLess, Edit, Delete, Add, CheckCircle, Cancel, SwapHoriz, SwitchAccount } from '@mui/icons-material';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import AddProjectForm from '../components/Projects/AddProjectForm';
import EditTaskModal from '../components/Projects/EditTaskModal';
import EditProjectModal from '../components/Projects/EditProjectModal';
import EditGoalModal from '../components/Projects/EditGoalModal';
import EditStakeModal from '../components/Projects/EditStakeModal';
import AddTaskModal from '../components/Projects/AddTaskModal';
import AddUserModal from '../components/Projects/AddUserModal';
import SelectGoalsModal from '../components/Projects/SelectGoalsModal.js';
import SelectStakesModal from '../components/Projects/SelectStakesModal';

const ProjectsPage = () => {
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [addingTask, setAddingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingStake, setEditingStake] = useState(null);
  const [addingProject, setAddingProject] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [addingUser, setAddingUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [addingUserToTask, setAddingUserToTask] = useState(null);
  const [selectGoalsModalOpen, setSelectGoalsModalOpen] = useState(false);
  const [selectStakesModalOpen, setSelectStakesModalOpen] = useState(false);
  const [selectedProjectForGoals, setSelectedProjectForGoals] = useState(null);
  const [selectedProjectForStakes, setSelectedProjectForStakes] = useState(null);
  
  useAuth();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      checkAdminAccess(token);
    }
  }, []);
  
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await client.get('/api/User');
      return response.data;
    },
  });
  
  const checkAdminAccess = async (token) => {
    try {
      const response = await client.get('/api/Account/access', {
        headers: {
          Auth: token,
        },
      });

      if (response.status === 200) {
        setIsAdmin(response.data === true);
      }
    } catch (err) {
      console.error('Ошибка при проверке прав администратора:', err);
      setIsAdmin(false);
    }
  };

  const canCompleteProject = (project) => {
    const tasksForProject = allTasks.filter((task) => task.idProject === project.idProject);
    const allTasksCompleted = tasksForProject.every((task) => task.status);
    const noTasks = tasksForProject.length === 0;
    return allTasksCompleted || noTasks;
  };

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await client.get('/api/Project');
      return response.data;
    },
  });

  const updateProjectCompletionMutation = useMutation({
    mutationFn: (updatedProject) => client.put('/api/Project', updatedProject),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });

  const handleAddUserToProject = async ({ userId, projectId, userRole }) => {
    try {
      await client.post(`/api/User/AddUserToProject?userId=${userId}&projectId=${projectId}&userRole=${userRole}`);
      queryClient.invalidateQueries(['projects']);
    } catch (error) {
      console.error('Ошибка при добавлении пользователя:', error);
    }
  };

  const handleCompleteProject = async (project) => {
    const tasksForProject = allTasks.filter((task) => task.idProject === project.idProject);
  
    const allTasksCompleted = tasksForProject.every((task) => task.status);
    const noTasks = tasksForProject.length === 0;
  
    if (allTasksCompleted || noTasks) {
      const updatedProject = { ...project, completed: true };
      await updateProjectCompletionMutation.mutateAsync(updatedProject);
    } else {
      alert('Невозможно завершить проект: не все задачи выполнены.');
    }
  };
  
  const addUserToTaskMutation = useMutation({
    mutationFn: ({ userId, taskId, userRole }) =>
      client.post(`/api/User/AddUserToTask?userId=${userId}&taskId=${taskId}&userRole=${userRole}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });
  
  const updateUserRoleInTaskMutation = useMutation({
    mutationFn: ({ userId, taskId, newRole }) =>
      client.put(`/api/User/UpdateUserRoleInTask?userId=${userId}&taskId=${taskId}&userRole=${newRole}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });
  
  const removeUserFromTaskMutation = useMutation({
    mutationFn: ({ userId, taskId }) =>
      client.delete(`/api/User/RemoveUserFromTask?userId=${userId}&taskId=${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const handleAddUserToTask = async ({ userId, taskId, userRole }) => {
    try {
      await addUserToTaskMutation.mutateAsync({ userId, taskId, userRole });
    } catch (error) {
      console.error('Ошибка при добавлении пользователя в задачу:', error);
    }
  };
  
  const handleUpdateUserRoleInTask = (userId, taskId, newRole) => {
    updateUserRoleInTaskMutation.mutate({ userId, taskId, newRole });
  };
  
  const handleRemoveUserFromTask = (userId, taskId) => {
    removeUserFromTaskMutation.mutate({ userId, taskId });
  };

  const handleUncompleteProject = async (project) => {
    const updatedProject = { ...project, completed: false };
    await updateProjectCompletionMutation.mutateAsync(updatedProject);
  };

  const { data: allTasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await client.get('/api/Task');
      return response.data;
    },
  });

  const { data: allStakes = [], isLoading: isStakesLoading } = useQuery({
    queryKey: ['stakes'],
    queryFn: async () => {
      const response = await client.get('/api/Stake');
      return response.data;
    },
  });

  const goalsQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ['goals', project.idProject],
      queryFn: () => fetchGoalsForProject(project.idProject),
    })),
  });

  const fetchGoalsForProject = async (projectId) => {
    const response = await client.get(`/api/Goal/${projectId}`);
    return response.data;
  };
  
  const linkGoalToProject = async ({ goalId, projectId }) => {
    const response = await client.post(`/api/Goal/LinkToProject?goal_id=${goalId}&project_id=${projectId}`);
    return response.data;
  };

  const linkGoalToProjectMutation = useMutation({
    mutationFn: linkGoalToProject,
    onSuccess: () => {
      console.log('Цель успешно добавлена в проект');
      queryClient.invalidateQueries(['projects']);
    },
    onError: (error) => {
      console.error('Ошибка при добавлении цели в проект:', error);
    },
  });
  
  const goalsByProjectId = goalsQueries.reduce((acc, query, index) => {
    const projectId = projects[index]?.idProject;
    if (projectId) {
      acc[projectId] = query.data || [];
    }
    return acc;
  }, {});
  const fetchAllGoals = async () => {
    const response = await client.get('/api/Goal');
    return response.data;
  };
  
  const { data: allGoals = [], isLoading, isError, error } = useQuery({
    queryKey: ['goals'], 
    queryFn: fetchAllGoals,
  });
  const addUserToProjectMutation = useMutation({
    mutationFn: ({ userId, projectId, userRole }) =>
      client.post(`/api/User/AddUserToProject?userId=${userId}&projectId=${projectId}&userRole=${userRole}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });

  const stakesQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ['stakes', project.idProject],
      queryFn: () => fetchStakesForProject(project.idProject),
    })),
  });

  const fetchStakesForProject = async (projectId) => {
    const response = await client.get(`/api/Stake/${projectId}`);
    return response.data;
  };

  const stakesByProjectId = stakesQueries.reduce((acc, query, index) => {
    const projectId = projects[index]?.idProject;
    if (projectId) {
      acc[projectId] = query.data || [];
    }
    return acc;
  }, {});

  const updateTaskStatusMutation = useMutation({
    mutationFn: (updatedTask) => client.put('/api/Task', updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask) => client.put('/api/Task', updatedTask),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setEditingTask(null);
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: (newTask) => client.post('/api/Task', newTask),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setAddingTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => client.delete(`/api/Task/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const handleOpenSelectGoalsModal = (project) => {
    setSelectedProjectForGoals(project);
    setSelectGoalsModalOpen(true);
  };

  const handleOpenSelectStakesModal = (project) => {
    setSelectedProjectForStakes(project);
    setSelectStakesModalOpen(true);
  };

  const handleSelectGoals = (selectedGoals) => {
    const updatedProject = { ...selectedProjectForGoals, goalIds: selectedGoals };
    updateProjectMutation.mutate(updatedProject);
  };

  const handleSelectStakes = (selectedStakes) => {
    const updatedProject = { ...selectedProjectForStakes, stakeholderIds: selectedStakes };
    updateProjectMutation.mutate(updatedProject);
  };
  
  const updateUserRoleInProjectMutation = useMutation({
    mutationFn: ({ userId, projectId, newRole }) => 
        client.put(`/api/User/UpdateUserRoleInProject?userId=${userId}&projectId=${projectId}&userRole=${newRole}`),
    onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
    },
});

const removeUserFromProjectMutation = useMutation({
    mutationFn: ({ userId, projectId }) => 
        client.delete(`/api/User/RemoveUserFromProject?userId=${userId}&projectId=${projectId}`),
    onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
    },
});
  
  const handleUpdateUserRole = (userId, projectId, newRole) => {
    updateUserRoleInProjectMutation.mutate({ userId, projectId, newRole });
  };
  
  const handleRemoveUserFromProject = (userId, projectId) => {
    removeUserFromProjectMutation.mutate({ userId, projectId });
  };
  
  const updateProjectMutation = useMutation({
    mutationFn: (updatedProject) => client.put('/api/Project', updatedProject),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setEditingProject(null);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => client.delete(`/api/Project/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (updatedGoal) => client.put('/api/Goal', updatedGoal),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setEditingGoal(null);
    },
  });

  const removeGoalFromProjectMutation = useMutation({
    mutationFn: ({ goalId, projectId }) =>
      client.post(`/api/Goal/RemoveFromProject?goal_id=${goalId}&project_id=${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
    },
  });
  
  const removeStakeFromProjectMutation = useMutation({
    mutationFn: ({ stakeId, projectId }) =>
      client.post(`/api/Stake/RemoveFromProject?stakeholder_id=${stakeId}&project_id=${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['stakes']);
    },
  });
  
  const handleRemoveGoalFromProject = (goalId, projectId) => {
    removeGoalFromProjectMutation.mutate({ goalId, projectId });
  };
  
  const handleRemoveStakeFromProject = (stakeId, projectId) => {
    removeStakeFromProjectMutation.mutate({ stakeId, projectId });
  };

  const updateStakeMutation = useMutation({
    mutationFn: (updatedStake) => client.put('/api/Stake', updatedStake),
    onSuccess: () => {
      queryClient.invalidateQueries(['stakes']);
      setEditingStake(null);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (newProject) => client.post('/api/Project', newProject),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setAddingProject(false);
    },
  });
  
  const handleAddProject = async (projectData, selectedStakes, selectedGoals, responsibleUsers, observerUsers, tasksData) => {
    try {
      const userIds = responsibleUsers.map(user => user.idUser).concat(
        observerUsers.map(user => user.idUser)
      );
  
      const userRoles = responsibleUsers.map(user => ({
        userId: user.idUser,
        role: 1,
      })).concat(
        observerUsers.map(user => ({
          userId: user.idUser,
          role: 0,
        }))
      );
  
      const tasksWithUserRoles = tasksData.map(task => ({
        nameTask: task.nameTask,
        description: task.description,
        deadLine: new Date(task.deadLine).toISOString(),
        status: task.status,
        userRoles: task.responsibleUsers.map(user => ({
          userId: user.idUser,
          role: 1, 
        })).concat(
          task.observerUsers.map(user => ({
            userId: user.idUser,
            role: 0,
          }))
        ),
        userIds: task.responsibleUsers.map(user => user.idUser).concat(
          task.observerUsers.map(user => user.idUser)
        ),
      }));
  
      const projectPayload = {
        nameProject: projectData.nameProject,
        startDate: new Date(projectData.startDate).toISOString(),
        stateProject: projectData.stateProject,
        description: projectData.description,
        userRoles: userRoles,
        userIds: userIds,
        goalIds: selectedGoals,
        stakeholderIds: selectedStakes,
        completed: false,
        tasks: tasksWithUserRoles,
      };
  
      console.log("Отправляемые данные:", projectPayload);
  
      await createProjectMutation.mutateAsync(projectPayload);
    } catch (error) {
      console.error('Ошибка при добавлении проекта:', error);
    }
  };
  
  const handleCancel = () => {
    console.log('Форма отменена');
  };
  
  const handleStatusChange = (task) => {
    const updatedTask = {
      ...task,
      status: !task.status,
    };
    updateTaskStatusMutation.mutate(updatedTask);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
  };

  const handleAddClick = (projectId) => {
    setAddingTask({ idProject: projectId });
  };

  const handleEditProjectClick = (project) => {
    setEditingProject(project);
  };

  const handleDeleteProject = (projectId) => {
    deleteProjectMutation.mutate(projectId);
  };

  const handleSaveTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate(editingTask);
    }
  };

  const handleAddTask = (taskPayload) => {
    addTaskMutation.mutate(taskPayload);
  };

  const handleSaveProject = () => {
    if (editingProject) {
      updateProjectMutation.mutate(editingProject);
    }
  };

  const handleDeleteTask = (taskId) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setAddingTask(null);
    setEditingProject(null);
    setEditingGoal(null);
    setEditingStake(null);
  };

  const handleExpand = (projectId) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(projectId);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (activeTab === 0) {
      return !project.completed;
    } else {
      return project.completed;
    }
  });

  const calculateProjectProgress = (projectId, isProjectCompleted) => {
    if (isProjectCompleted) {
      return 100;
    }
  
    const tasksForProject = allTasks.filter((task) => task.idProject === projectId);
    const totalTasks = tasksForProject.length;
    const completedTasks = tasksForProject.filter((task) => task.status).length;
  
    if (totalTasks === 0) return 0;
    return (completedTasks / totalTasks) * 100;
  };

  const getProgressColor = (progress, isProjectCompleted) => {
    if (isProjectCompleted) {
      return '#4caf50';
    }
  
    const red = Math.round(255 * (1 - progress / 100));
    const green = Math.round(255 * (progress / 100));
    return `rgb(${red}, ${green}, 0)`;
  };

  if (isProjectsLoading || isTasksLoading || isStakesLoading) return <CircularProgress />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        padding: isMobile ? 2 : 3,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: isMobile ? 2 : 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'center' }}>
              Проекты
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddingProject(true)}
                sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              >
                Добавить проект
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/goals"
                    sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  >
                    Перейти к целям
                  </Button>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/stakes"
                    sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  >
                    Перейти к стейкхолдерам
                  </Button>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/users"
                    sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  >
                    Пользователи
                  </Button>
                </>
              )}
            </Box>
          </Box>

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
            <Tab label="Активные проекты" />
            <Tab label="Завершённые проекты" />
          </Tabs>

          <List>
            {filteredProjects.map((project) => {
              const progress = calculateProjectProgress(project.idProject);
              const projectGoals = goalsByProjectId[project.idProject] || [];
              const projectStakes = stakesByProjectId[project.idProject] || [];
              const isProjectCompleted = project.completed;
              
              return (
                <React.Fragment key={project.idProject}>
<ListItem
  component="div"
  onClick={() => handleExpand(project.idProject)}
  sx={{
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    '&:hover': { backgroundColor: 'action.hover' },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    p: 2,
    borderRadius: 2,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    flexDirection: isMobile ? 'column' : 'row',
  }}
>
  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
    {!project.completed && (
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          handleCompleteProject(project); 
        }}
        sx={{ color: 'success.main' }}
        disabled={!canCompleteProject(project)} 
      >
        <CheckCircle />
      </IconButton>
    )}

    {project.completed && (
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          handleUncompleteProject(project);
        }}
        sx={{ color: 'warning.main' }}
      >
        <Cancel />
      </IconButton>
    )}

    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: 'primary.main',
        color: 'white',
        fontWeight: 'medium',
        fontSize: '0.875rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      {allTasks.filter((task) => task.idProject === project.idProject).length}
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        {project.nameProject}
      </Typography>
      <Typography variant="body2">
        Статус: {project.stateProject}
      </Typography>
      <Typography variant="body2">
        Дата начала: {new Date(project.startDate).toLocaleDateString()}
      </Typography>
      <Typography variant="body2">
        Описание: {project.description}
      </Typography>
    </Box>
  </Box>

  <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 2, borderColor: 'primary.main', mx: 2 }} />

  <Box sx={{ mb: 3 }}>
  <Button
    variant="contained"
    startIcon={<Add />}
    onClick={() => {
      setSelectedProjectForGoals(project);
      setSelectGoalsModalOpen(true);
    }}
    sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', mb: 2 }}
  >
    Добавить цели
  </Button>

  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
    Цели:
  </Typography>
  {projectGoals.length > 0 ? (
    projectGoals.map((goal) => (
      <Box key={goal.idGoal} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">- {goal.abNameGoal}</Typography>
        <IconButton
          size="small"
          onClick={() => handleRemoveGoalFromProject(goal.idGoal, project.idProject)}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    ))
  ) : (
    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
      Цели не добавлены
    </Typography>
  )}
</Box>
<SelectGoalsModal
  selectGoalsModalOpen={selectGoalsModalOpen}
  setSelectGoalsModalOpen={setSelectGoalsModalOpen}
  allGoals={allGoals}
  selectedProjectForGoals={selectedProjectForGoals}
  setSelectedProjectForGoals={setSelectedProjectForGoals}
  goalsByProjectId={goalsByProjectId}
/>
  <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 2, borderColor: 'primary.main', mx: 2 }} />

  <Box
    sx={{
      flex: 1,
      borderRight: '2px solid primary.main',
      pr: 2,
      mr: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    }}
  >
    <Button
  variant="contained"
  startIcon={<Add />}
  onClick={(e) => {
    e.stopPropagation();
    handleOpenSelectStakesModal(project);
  }}
  sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', mb: 2 }}
>
  Добавить стейкхолдеров
</Button>
<Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
  Стейкхолдеры:
</Typography>
{projectStakes.length > 0 ? (
  projectStakes.map((stake) => (
    <Box key={stake.idStake} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2">- {stake.abNameStake}</Typography>
      <IconButton
        size="small"
        onClick={() => handleRemoveStakeFromProject(stake.idStake, project.idProject)}
        sx={{ color: 'error.main' }}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  ))
) : (
  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
    Стейкхолдеры не добавлены
  </Typography>
)}
  </Box>

  <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 2, borderColor: 'primary.main', mx: 2 }} />

  <Box
    sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
      Пользователи:
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        size="small"
        onClick={(e) => {
          console.log(addingUser);
          e.stopPropagation();
          setAddingUser(project.idProject); 
        }}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          borderRadius: '50%',
          width: '24px',
          height: '24px',
        }}
      >
        <Add fontSize="small" />
      </IconButton>
    </Box>
    <AddUserModal
        open={addingUser}
        onClose={() => setAddingUser(false)}
        onSubmit={(data) => handleAddUserToProject({ ...data, projectId: project.idProject })}
        users={users}
      />
    {project.userRoles.map((userRole) => (
      <Box key={userRole.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          component="span"
          variant="body2"
          sx={{ fontWeight: userRole.role === 1 ? 'bold' : 'normal' }}
        >
          {userRole.name[0]}. {userRole.surname[0]}.
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleUpdateUserRole(userRole.userId, project.idProject, userRole.role === 1 ? 0 : 1);
          }}
          sx={{ color: 'primary.main' }}
        >
          <SwapHoriz fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveUserFromProject(userRole.userId, project.idProject);
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    ))}
  </Box>
  <SelectStakesModal
    selectStakesModalOpen={selectStakesModalOpen}
    setSelectStakesModalOpen={setSelectStakesModalOpen}
    allStakes={allStakes}
    selectedProjectForStakes={selectedProjectForStakes}
    setSelectedProjectForStakes={setSelectedProjectForStakes}
    stakesByProjectId={stakesByProjectId}
  />
  <Box sx={{ ml: isMobile ? 0 : 2, mt: isMobile ? 2 : 0 }}>
    {expandedProjectId === project.idProject ? <ExpandLess /> : <ExpandMore />}
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        handleEditProjectClick(project);
      }}
      sx={{ color: 'primary.main' }}
    >
      <Edit />
    </IconButton>
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteProject(project.idProject);
      }}
      sx={{ color: 'error.main' }}
    >
      <Delete />
    </IconButton>
  </Box>
</ListItem>

<AddUserModal
  open={Boolean(addingUserToTask)}
  onClose={() => setAddingUserToTask(null)}
  onSubmit={(data) => handleAddUserToTask({ ...data, taskId: addingUserToTask })}
  users={users}
/>
<Box sx={{ width: '100%', pl: 2, pr: 2 }}>
<LinearProgress
  variant="determinate"
  value={isProjectCompleted ? 100 : calculateProjectProgress(project.idProject, isProjectCompleted)}
  sx={{
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    '& .MuiLinearProgress-bar': {
      backgroundColor: getProgressColor(
        isProjectCompleted ? 100 : calculateProjectProgress(project.idProject, isProjectCompleted),
        isProjectCompleted 
      ),
    },
  }}
/>
  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
  {`${isProjectCompleted ? 100 : Math.round(calculateProjectProgress(project.idProject, isProjectCompleted))}% выполнено`}
  </Typography>
</Box>

<Collapse in={expandedProjectId === project.idProject} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>
    <ListItem>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleAddClick(project.idProject)}
        sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
      >
        Добавить задачу
      </Button>
    </ListItem>

    {allTasks
      .filter((task) => task.idProject === project.idProject)
      .map((task, index, tasksArray) => (
        <React.Fragment key={task.idTask}>
          <ListItem sx={{ pl: 4, flexDirection: 'column', alignItems: 'flex-start' }}>
            <ListItemText
              primary={task.nameTask}
              secondary={`Дедлайн: ${new Date(task.deadLine).toLocaleDateString()}`}
              sx={{ width: '100%' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {task.status ? 'Выполнено' : 'Не выполнено'}
              </Typography>
              <Switch
                checked={task.status}
                onChange={() => handleStatusChange(task)}
                color="primary"
                disabled={project.completed}
              />
              <IconButton onClick={() => handleEditClick(task)} sx={{ color: 'primary.main' }}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => handleDeleteTask(task.idTask)} sx={{ color: 'error.main' }}>
                <Delete />
              </IconButton>
            </Box>
            <Box sx={{ mt: 1, width: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Пользователи:
              </Typography>
              {task.userRoles.length > 0 ? (
                task.userRoles.map((userRole) => (
                  <Box key={userRole.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ fontWeight: userRole.role === 1 ? 'bold' : 'normal' }}
                    >
                      {userRole.name[0]}. {userRole.surname[0]}.
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateUserRoleInTask(userRole.userId, task.idTask, userRole.role === 1 ? 0 : 1);
                      }}
                      sx={{ color: 'primary.main' }}
                    >
                      <SwapHoriz fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveUserFromTask(userRole.userId, task.idTask);
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  Пользователи не назначены
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddingUserToTask(task.idTask);
                }}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  mt: 1,
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
          </ListItem>

          {index < tasksArray.length - 1 && <Divider sx={{ my: 2 }} />}
        </React.Fragment>
      ))}
  </List>
</Collapse>
                </React.Fragment>
              );
            })}
          </List>

          <Modal open={addingProject} onClose={() => setAddingProject(false)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isMobile ? '90%' : '80%',
                maxWidth: 800,
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                overflowY: 'auto',
                borderRadius: 4,
              }}
            >
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Добавить проект
              </Typography>
              <AddProjectForm onSubmit={handleAddProject} onCancel={handleCancel} onClose={() => setAddingProject(false)} />
            </Box>
          </Modal>

          <AddTaskModal
            open={Boolean(addingTask)}
            onClose={handleCloseModal}
            addingTask={addingTask}
            setAddingTask={setAddingTask}
            handleAddTask={handleAddTask}
          />

          <EditTaskModal
            open={Boolean(editingTask)}
            onClose={handleCloseModal}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            handleSaveTask={handleSaveTask}
          />

          <EditProjectModal
            open={Boolean(editingProject)}
            onClose={handleCloseModal}
            editingProject={editingProject}
            setEditingProject={setEditingProject}
            handleSaveProject={handleSaveProject}
          />

          <EditGoalModal
            open={Boolean(editingGoal)}
            onClose={handleCloseModal}
            editingGoal={editingGoal}
            setEditingGoal={setEditingGoal}
            updateGoalMutation={updateGoalMutation}
          />

          <EditStakeModal
            open={Boolean(editingStake)}
            onClose={handleCloseModal}
            editingStake={editingStake}
            setEditingStake={setEditingStake}
            updateStakeMutation={updateStakeMutation}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default ProjectsPage;