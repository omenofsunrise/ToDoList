import React from 'react';
import { List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const GoalList = ({ goals, onEditClick, onDeleteClick }) => {
  return (
    <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <List>
        {goals.map((goal) => (
          <ListItem key={goal.idGoal} sx={{ borderBottom: '1px solid #eee' }}>
            <ListItemText
              primary={goal.nameGoal}
              secondary={goal.abNameGoal}
            />
            <IconButton onClick={() => onEditClick(goal)} sx={{ color: 'primary.main' }}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => onDeleteClick(goal.idGoal)} sx={{ color: 'error.main' }}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default GoalList;