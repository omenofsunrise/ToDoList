import React from 'react';
import { Button } from '@mui/material';
import useAuth from '../hooks/useAuth';

const Header = () => {
  const { logout } = useAuth();

  return (
    <Button
      variant="contained"
      onClick={logout}
      sx={{
        position: 'fixed', 
        top: 16,
        right: 16,
        zIndex: 1000,
        backgroundColor: '#ff4444',
        color: '#fff', 
        borderRadius: '20px',
        padding: '8px 16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          backgroundColor: '#cc0000',
        },
      }}
    >
      Выйти
    </Button>
  );
};

export default Header;