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
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  const linkStakeToProject = async ({ stakeholderId, projectId }) => {
    const response = await client.post(
      `/api/Stake/LinkToProject?stakeholder_id=${stakeholderId}&project_id=${projectId}`
    );
    return response.data;
  };

  const linkStakeToProjectMutation = useMutation({
    mutationFn: linkStakeToProject,
    onSuccess: () => {
      console.log('Стейкхолдер успешно добавлен в проект');
      queryClient.invalidateQueries(['projects']);
    },
    onError: (error) => {
      console.error('Ошибка при добавлении стейкхолдера в проект:', error);
    },
  });

  const handleSelectStakes = (selectedStakes) => {
    if (!selectedProjectForStakes) return;

    selectedStakes.forEach((stakeholderId) => {
      linkStakeToProjectMutation.mutate({
        stakeholderId,
        projectId: selectedProjectForStakes.idProject,
      });
    });

    setSelectStakesModalOpen(false);
  };

  return (
    <Modal open={selectStakesModalOpen} onClose={() => setSelectStakesModalOpen(false)}>
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
                checked={selectedProjectForStakes?.stakeholderIds?.includes(stake.idStake)}
                onChange={(e) => {
                  const selectedStakes = selectedProjectForStakes.stakeholderIds || [];
                  if (e.target.checked) {
                    selectedStakes.push(stake.idStake);
                  } else {
                    const index = selectedStakes.indexOf(stake.idStake);
                    if (index > -1) {
                      selectedStakes.splice(index, 1);
                    }
                  }
                  setSelectedProjectForStakes({ ...selectedProjectForStakes, stakeholderIds: selectedStakes });
                }}
              />
              <ListItemText primary={stake.nameStake} secondary={stake.AbNameStake} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => handleSelectStakes(selectedProjectForStakes.stakeholderIds)}
            sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
          >
            Сохранить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SelectStakesModal;