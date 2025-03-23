import React from 'react';
import { List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const StakeList = ({ stakes, onEditClick, onDeleteClick }) => {
  return (
    <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <List>
        {stakes.map((stake) => (
          <ListItem key={stake.idStake} sx={{ borderBottom: '1px solid #eee' }}>
            <ListItemText
              primary={stake.nameStake}
              secondary={stake.abNameStake}
            />
            <IconButton onClick={() => onEditClick(stake)} sx={{ color: 'primary.main' }}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => onDeleteClick(stake.idStake)} sx={{ color: 'error.main' }}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StakeList;