import React from 'react';
import { Modal, Box, Typography, useTheme, useMediaQuery } from '@mui/material';

const UserModal = ({ open, onClose, title, children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '90%' : 400,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          p: isMobile ? 2 : 4,
          background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            textAlign: 'center',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
          }}
        >
          {title}
        </Typography>
        {children}
      </Box>
    </Modal>
  );
};

export default UserModal;