import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Button, CircularProgress, Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import StakeList from '../components/Stakes/StakeList';
import StakeModal from '../components/Stakes/StakeModal';
import StakeForm from '../components/Stakes/StakeForm';

const StakesPage = () => {
  const [editingStake, setEditingStake] = useState(null);
  const [addingStake, setAddingStake] = useState(false);
  const queryClient = useQueryClient();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useAuth(true);

  const { data: stakes = [], isLoading: isStakesLoading } = useQuery({
    queryKey: ['stakes'],
    queryFn: async () => {
      const response = await client.get('/api/Stake');
      return response.data;
    },
  });

  const updateStakeMutation = useMutation({
    mutationFn: (updatedStake) => client.put('/api/Stake', updatedStake),
    onSuccess: () => {
      queryClient.invalidateQueries(['stakes']);
      setEditingStake(null);
    },
  });

  const deleteStakeMutation = useMutation({
    mutationFn: (stakeId) => client.delete(`/api/Stake/${stakeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['stakes']);
    },
  });

  const addStakeMutation = useMutation({
    mutationFn: (newStake) => client.post('/api/Stake', newStake),
    onSuccess: () => {
      queryClient.invalidateQueries(['stakes']);
      setAddingStake(false);
    },
  });

  const handleEditClick = (stake) => {
    setEditingStake(stake);
  };

  const handleDeleteStake = (stakeId) => {
    deleteStakeMutation.mutate(stakeId);
  };

  const handleSaveStake = (updatedStake) => {
    updateStakeMutation.mutate(updatedStake);
  };

  const handleAddStake = (newStake) => {
    addStakeMutation.mutate(newStake);
  };

  const handleCloseModal = () => {
    setEditingStake(null);
    setAddingStake(false);
  };

  if (isStakesLoading) return <CircularProgress />;

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
              Стейкхолдеры
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
            onClick={() => setAddingStake(true)}
            sx={{ mb: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: isMobile ? '100%' : 'auto' }}
          >
            Добавить стейкхолдера
          </Button>

          <StakeList
            stakes={stakes}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteStake}
          />

          <StakeModal open={Boolean(editingStake)} onClose={handleCloseModal} title="Редактировать Stake">
            <StakeForm
              initialData={editingStake}
              onSubmit={handleSaveStake}
              onCancel={handleCloseModal}
            />
          </StakeModal>

          <StakeModal open={addingStake} onClose={handleCloseModal} title="Добавить стейкхолдера">
            <StakeForm
              onSubmit={handleAddStake}
              onCancel={handleCloseModal}
            />
          </StakeModal>
        </Box>
      </Container>
    </Box>
  );
};

export default StakesPage;