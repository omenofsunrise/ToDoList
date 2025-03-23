import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Button, CircularProgress, Box, Container, useMediaQuery, useTheme, Snackbar, Alert } from '@mui/material';
import { Add, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import UserList from '../components/Users/UserList';
import UserModal from '../components/Users/UserModal';
import UserForm from '../components/Users/UserForm';
import ChangePasswordForm from '../components/Users/ChangePasswordForm';

const UsersPage = () => {
  const [editingUser, setEditingUser] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const queryClient = useQueryClient();
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useAuth(true);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarState({
      open: true,
      message,
      severity,
    });
  };
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await client.get('/api/User');
      return response.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (updatedUser) => client.put('/api/User/UpdateUser', updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setEditingUser(null);
      showSnackbar('Пользователь успешно обновлён!');
    },
    onError: () => {
      showSnackbar('Ошибка при обновлении пользователя', 'error');
    },
  });

  const updatePasswordMutation = useMutation({
  mutationFn: ({ idUser, newPassword }) => {
    const queryParams = new URLSearchParams({
      idUser,
      newPassword,
    }).toString();
    const url = `/api/User/UpdatePassword?${queryParams}`;
    return client.put(url);
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['users']);
    setChangingPasswordUser(null);
    showSnackbar('Пароль успешно изменён!');
  },
  onError: () => {
    showSnackbar('Ошибка при изменении пароля', 'error');
  },
});

const deleteUserMutation = useMutation({
  mutationFn: (userId) => client.delete(`/api/User/${userId}`),
  onSuccess: () => {
    queryClient.invalidateQueries(['users']);
    showSnackbar('Пользователь успешно удалён!');
  },
  onError: () => {
    showSnackbar('Ошибка при удалении пользователя', 'error');
  },
});

  const addUserMutation = useMutation({
    mutationFn: (newUser) => client.post('/api/User/register', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setAddingUser(false);
      showSnackbar('Пользователь успешно добавлен!'); 
    },
    onError: () => {
      showSnackbar('Ошибка при добавлении пользователя', 'error');
    },
  });

  const handleEditClick = (user) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (userId) => {
    deleteUserMutation.mutate(userId);
  };

  const handleSaveUser = (updatedUser) => {
    updateUserMutation.mutate(updatedUser);
  };

  const handleAddUser = (newUser) => {
    addUserMutation.mutate(newUser);
  };

  const handleChangePassword = (idUser, newPassword) => {
    updatePasswordMutation.mutate({ idUser, newPassword });
  };

  const handleCloseModal = () => {
    setEditingUser(null);
    setAddingUser(false);
    setChangingPasswordUser(null);
  };

  if (isUsersLoading) return <CircularProgress />;

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
              Пользователи
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/projects"
              startIcon={<ArrowBack />}
              sx={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            >
              Перейти к проектам
            </Button>
          </Box>
  
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddingUser(true)}
            sx={{ mb: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', width: isMobile ? '100%' : 'auto' }}
          >
            Добавить пользователя
          </Button>
  
          <UserList
            users={users}
            onEditClick={handleEditClick}
            onChangePasswordClick={setChangingPasswordUser}
            onDeleteClick={handleDeleteUser}
          />
  
          <UserModal open={Boolean(editingUser)} onClose={handleCloseModal} title="Редактировать пользователя">
            <UserForm
              initialData={editingUser}
              onSubmit={handleSaveUser}
              onCancel={handleCloseModal}
              isEditing={true}
            />
          </UserModal>
  
          <UserModal open={addingUser} onClose={handleCloseModal} title="Добавить пользователя">
            <UserForm
              onSubmit={handleAddUser}
              onCancel={handleCloseModal}
              isEditing={false}
            />
          </UserModal>
  
          <UserModal open={Boolean(changingPasswordUser)} onClose={handleCloseModal} title={`Сменить пароль для ${changingPasswordUser?.username}`}>
            <ChangePasswordForm
              onSubmit={(newPassword) => handleChangePassword(changingPasswordUser.idUser, newPassword)}
              onCancel={handleCloseModal}
            />
          </UserModal>
        </Box>
      </Container>
  
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={() => setSnackbarState((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', 
            animation: 'fadeIn 0.3s ease-in-out',
          },
        }}
      >
        <Alert
          onClose={() => setSnackbarState((prev) => ({ ...prev, open: false }))}
          severity={snackbarState.severity}
          sx={{
            width: '100%',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: 'bold',
            borderRadius: '12px',
          }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage;