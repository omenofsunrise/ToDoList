import React from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  Checkbox,
  ListItemText,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';

const SelectGoalsModal = ({
  selectGoalsModalOpen,
  setSelectGoalsModalOpen,
  allGoals,
  selectedProjectForGoals,
  setSelectedProjectForGoals,
  goalsByProjectId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  const getCurrentProjectGoalIds = () => {
    if (!selectedProjectForGoals) return [];
    const projectGoals = goalsByProjectId[selectedProjectForGoals.idProject] || [];
    return projectGoals.map(goal => goal.idGoal);
  };

  const [selectedGoalIds, setSelectedGoalIds] = React.useState(getCurrentProjectGoalIds());

  React.useEffect(() => {
    setSelectedGoalIds(getCurrentProjectGoalIds());
  }, [selectedProjectForGoals]);

  const linkGoalToProject = async ({ goalId, projectId }) => {
    const response = await client.post(`/api/Goal/LinkToProject?goal_id=${goalId}&project_id=${projectId}`);
    return response.data;
  };

  const unlinkGoalFromProject = async ({ goalId, projectId }) => {
    const response = await client.post(`/api/Goal/RemoveFromProject?goal_id=${goalId}&project_id=${projectId}`);
    return response.data;
  };

  const goalMutation = useMutation({
    mutationFn: async ({ goalId, projectId, shouldLink }) => {
      if (shouldLink) {
        return linkGoalToProject({ goalId, projectId });
      } else {
        return unlinkGoalFromProject({ goalId, projectId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['goals']);
    },
    onError: (error) => {
      console.error('Ошибка при изменении связи цели с проектом:', error);
    },
  });

  const handleGoalToggle = (goalId) => {
    const newSelectedGoalIds = selectedGoalIds.includes(goalId)
      ? selectedGoalIds.filter(id => id !== goalId)
      : [...selectedGoalIds, goalId];
    
    setSelectedGoalIds(newSelectedGoalIds);
  };

  const handleSaveGoals = () => {
    if (!selectedProjectForGoals) return;

    const currentGoalIds = getCurrentProjectGoalIds();
    const goalsToAdd = selectedGoalIds.filter(id => !currentGoalIds.includes(id));
    const goalsToRemove = currentGoalIds.filter(id => !selectedGoalIds.includes(id));

    goalsToAdd.forEach(goalId => {
      goalMutation.mutate({
        goalId,
        projectId: selectedProjectForGoals.idProject,
        shouldLink: true
      });
    });

    goalsToRemove.forEach(goalId => {
      goalMutation.mutate({
        goalId,
        projectId: selectedProjectForGoals.idProject,
        shouldLink: false
      });
    });

    setSelectGoalsModalOpen(false);
  };

  return (
    <Modal open={selectGoalsModalOpen} onClose={() => setSelectGoalsModalOpen(false)}>
      <Box
        onClick={(e) => e.stopPropagation()}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Выберите цели для проекта
          </Typography>
          <IconButton onClick={() => setSelectGoalsModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {allGoals.map((goal) => (
            <ListItem key={goal.idGoal}>
              <Checkbox
                checked={selectedGoalIds.includes(goal.idGoal)}
                onChange={() => handleGoalToggle(goal.idGoal)}
              />
              <ListItemText 
                primary={goal.nameGoal} 
                secondary={goal.abNameGoal || goal.AbNameGoal} 
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveGoals}
            sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            disabled={goalMutation.isLoading}
          >
            {goalMutation.isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SelectGoalsModal;