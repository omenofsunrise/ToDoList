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
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  // Функция для выполнения запроса
  const linkGoalToProject = async ({ goalId, projectId }) => {
    const response = await client.post(`/api/Goal/LinkToProject?goal_id=${goalId}&project_id=${projectId}`);
    return response.data;
  };

  // Мутация для связывания цели с проектом
  const linkGoalToProjectMutation = useMutation({
    mutationFn: linkGoalToProject,
    onSuccess: () => {
      console.log('Цель успешно добавлена в проект');
      queryClient.invalidateQueries(['projects']); // Обновляем данные проектов
    },
    onError: (error) => {
      console.error('Ошибка при добавлении цели в проект:', error);
    },
  });

  // Обработчик сохранения выбранных целей
  const handleSelectGoals = (selectedGoals) => {
    if (!selectedProjectForGoals) return;

    // Для каждой выбранной цели вызываем мутацию
    selectedGoals.forEach((goalId) => {
      linkGoalToProjectMutation.mutate({
        goalId,
        projectId: selectedProjectForGoals.idProject,
      });
    });

    setSelectGoalsModalOpen(false); // Закрываем модальное окно
  };

  return (
    <Modal open={selectGoalsModalOpen} onClose={() => setSelectGoalsModalOpen(false)}>
  <Box
    onClick={(e) => e.stopPropagation()} // Останавливаем всплытие для всего окна
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
    {/* Заголовок модального окна */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Выберите цели для проекта
      </Typography>
      <IconButton onClick={() => setSelectGoalsModalOpen(false)}>
        <CloseIcon />
      </IconButton>
    </Box>

    {/* Список целей */}
    <List>
      {allGoals.map((goal) => (
        <ListItem key={goal.idGoal}>
          <Checkbox
            checked={selectedProjectForGoals?.goalIds?.includes(goal.idGoal)}
            onChange={(e) => {
              const selectedGoals = selectedProjectForGoals.goalIds || [];
              if (e.target.checked) {
                selectedGoals.push(goal.idGoal);
              } else {
                const index = selectedGoals.indexOf(goal.idGoal);
                if (index > -1) {
                  selectedGoals.splice(index, 1);
                }
              }
              setSelectedProjectForGoals({ ...selectedProjectForGoals, goalIds: selectedGoals });
            }}
          />
          <ListItemText primary={goal.nameGoal} secondary={goal.AbNameGoal} />
        </ListItem>
      ))}
    </List>

    {/* Кнопка сохранения */}
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
      <Button
        variant="contained"
        onClick={() => handleSelectGoals(selectedProjectForGoals.goalIds)}
        sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
      >
        Сохранить
      </Button>
    </Box>
  </Box>
</Modal>
  );
};

export default SelectGoalsModal;