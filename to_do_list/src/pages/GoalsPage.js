import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Button, CircularProgress, Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import GoalList from '../components/Goals/GoalList';
import GoalModal from '../components/Goals/GoalModal';
import GoalForm from '../components/Goals/GoalForm';

const GoalsPage = () => {
  const [editingGoal, setEditingGoal] = useState(null);
  const [addingGoal, setAddingGoal] = useState(false);
  const queryClient = useQueryClient();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: goals = [], isLoading: isGoalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await client.get('/api/Goal');
      return response.data;
    },
  });

  useAuth(true);

  const updateGoalMutation = useMutation({
    mutationFn: (updatedGoal) => client.put('/api/Goal', updatedGoal),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setEditingGoal(null);
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId) => client.delete(`/api/Goal/${goalId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
    },
  });

  const addGoalMutation = useMutation({
    mutationFn: (newGoal) => client.post('/api/Goal', newGoal),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
      setAddingGoal(false);
    },
  });

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
  };

  const handleDeleteGoal = (goalId) => {
    deleteGoalMutation.mutate(goalId);
  };

  const handleSaveGoal = (updatedGoal) => {
    updateGoalMutation.mutate(updatedGoal);
  };

  const handleAddGoal = (newGoal) => {
    addGoalMutation.mutate(newGoal);
  };

  const handleCloseModal = () => {
    setEditingGoal(null);
    setAddingGoal(false);
  };

  if (isGoalsLoading) return <CircularProgress />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        padding: isMobile ? 2 : 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: isMobile ? 2 : 4,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'center', mb: isMobile ? 2 : 0 }}>
              Цели
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/projects"
              startIcon={<ArrowBack />}
              sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            >
              Вернуться к проектам
            </Button>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddingGoal(true)}
            sx={{ mb: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: isMobile ? '100%' : 'auto' }}
          >
            Добавить цель
          </Button>

          <GoalList
            goals={goals}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteGoal}
          />

          <GoalModal open={Boolean(editingGoal)} onClose={handleCloseModal} title="Редактировать цель">
            <GoalForm
              initialData={editingGoal}
              onSubmit={handleSaveGoal}
              onCancel={handleCloseModal}
            />
          </GoalModal>

          <GoalModal open={addingGoal} onClose={handleCloseModal} title="Добавить цель">
            <GoalForm
              onSubmit={handleAddGoal}
              onCancel={handleCloseModal}
            />
          </GoalModal>
        </Box>
      </Container>
    </Box>
  );
};

export default GoalsPage;