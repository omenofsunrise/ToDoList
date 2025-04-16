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

const SelectStakesModal = ({
  selectStakesModalOpen,
  setSelectStakesModalOpen,
  allStakes,
  selectedProjectForStakes,
  setSelectedProjectForStakes,
  stakesByProjectId, // Добавляем пропс с стейкхолдерами проекта
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  // Получаем ID стейкхолдеров, уже связанных с проектом
  const getCurrentProjectStakeIds = () => {
    if (!selectedProjectForStakes) return [];
    const projectStakes = stakesByProjectId[selectedProjectForStakes.idProject] || [];
    return projectStakes.map(stake => stake.idStake);
  };

  // Состояние для отслеживания выбранных стейкхолдеров
  const [selectedStakeIds, setSelectedStakeIds] = React.useState(getCurrentProjectStakeIds());

  // Обновляем выбранные стейкхолдеры при изменении проекта
  React.useEffect(() => {
    setSelectedStakeIds(getCurrentProjectStakeIds());
  }, [selectedProjectForStakes]);

  // Функция для выполнения запроса
  const linkStakeToProject = async ({ stakeId, projectId }) => {
    const response = await client.post(
      `/api/Stake/LinkToProject?stakeholder_id=${stakeId}&project_id=${projectId}`
    );
    return response.data;
  };

  const unlinkStakeFromProject = async ({ stakeId, projectId }) => {
    const response = await client.post(
      `/api/Stake/RemoveFromProject?stakeholder_id=${stakeId}&project_id=${projectId}`
    );
    return response.data;
  };

  // Мутация для связывания/отвязывания стейкхолдера с проектом
  const stakeMutation = useMutation({
    mutationFn: async ({ stakeId, projectId, shouldLink }) => {
      if (shouldLink) {
        return linkStakeToProject({ stakeId, projectId });
      } else {
        return unlinkStakeFromProject({ stakeId, projectId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['stakes']);
    },
    onError: (error) => {
      console.error('Ошибка при изменении связи стейкхолдера с проектом:', error);
    },
  });

  // Обработчик изменения состояния чекбокса
  const handleStakeToggle = (stakeId) => {
    const newSelectedStakeIds = selectedStakeIds.includes(stakeId)
      ? selectedStakeIds.filter(id => id !== stakeId)
      : [...selectedStakeIds, stakeId];
    
    setSelectedStakeIds(newSelectedStakeIds);
  };

  // Обработчик сохранения выбранных стейкхолдеров
  const handleSaveStakes = () => {
    if (!selectedProjectForStakes) return;

    // Определяем, какие стейкхолдеры нужно добавить, а какие удалить
    const currentStakeIds = getCurrentProjectStakeIds();
    const stakesToAdd = selectedStakeIds.filter(id => !currentStakeIds.includes(id));
    const stakesToRemove = currentStakeIds.filter(id => !selectedStakeIds.includes(id));

    // Выполняем мутации для добавления/удаления стейкхолдеров
    stakesToAdd.forEach(stakeId => {
      stakeMutation.mutate({
        stakeId,
        projectId: selectedProjectForStakes.idProject,
        shouldLink: true
      });
    });

    stakesToRemove.forEach(stakeId => {
      stakeMutation.mutate({
        stakeId,
        projectId: selectedProjectForStakes.idProject,
        shouldLink: false
      });
    });

    setSelectStakesModalOpen(false);
  };

  return (
    <Modal open={selectStakesModalOpen} onClose={() => setSelectStakesModalOpen(false)}>
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
            Выберите стейкхолдеров для проекта
          </Typography>
          <IconButton onClick={() => setSelectStakesModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {allStakes.map((stake) => (
            <ListItem key={stake.idStake}>
              <Checkbox
                checked={selectedStakeIds.includes(stake.idStake)}
                onChange={() => handleStakeToggle(stake.idStake)}
              />
              <ListItemText 
                primary={stake.nameStake} 
                secondary={stake.abNameStake || stake.AbNameStake} 
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveStakes}
            sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            disabled={stakeMutation.isLoading}
          >
            {stakeMutation.isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SelectStakesModal;