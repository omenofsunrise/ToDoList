import React, { useState } from 'react';
import { Modal, Box, Typography, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const AddUserModal = ({ open, onClose, onSubmit, users, projectId }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userRole, setUserRole] = useState('');

  const handleSubmit = () => {
    onSubmit({ userId: selectedUserId, projectId, userRole });
    onClose();
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
      onClick={handleModalClick}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
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
          Добавить пользователя в проект
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Пользователь</InputLabel>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              label="Пользователь"
            >
              {users.map((user) => (
                <MenuItem key={user.idUser} value={user.idUser}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Роль</InputLabel>
            <Select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              label="Роль"
            >
              <MenuItem value={0}>Наблюдатель</MenuItem>
              <MenuItem value={1}>Ответственный</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            Добавить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddUserModal;