import React from 'react';
import { List, ListItem, ListItemText, IconButton, Paper, useTheme, useMediaQuery, Box } from '@mui/material';
import { Edit, Delete, LockReset } from '@mui/icons-material';

const UserList = ({ users, onEditClick, onChangePasswordClick, onDeleteClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      sx={{
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        background: 'rgba(255, 255, 255, 0.9)',
      }}
    >
      <List>
        {users.map((user) => (
          <ListItem
            key={user.idUser}
            sx={{
              borderBottom: '1px solid #eee',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 1 : 2,
              padding: isMobile ? 2 : 3,
            }}
          >
            <ListItemText
              primary={`${user.name} ${user.surname}`}
              secondary={`Логин: ${user.username}`}
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => onEditClick(user)} sx={{ color: 'primary.main' }}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => onChangePasswordClick(user)} sx={{ color: 'secondary.main' }}>
                <LockReset />
              </IconButton>
              <IconButton onClick={() => onDeleteClick(user.idUser)} sx={{ color: 'error.main' }}>
                <Delete />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default UserList;