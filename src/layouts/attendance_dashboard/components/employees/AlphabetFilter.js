import React from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';

const AlphabetFilter = ({ onLetterSelect, selectedLetter }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      mb: 2,
      overflowX: 'auto',
      py: 1
    }}>
      <ButtonGroup variant="outlined" size="small">
        <Button 
          onClick={() => onLetterSelect('')}
          variant={selectedLetter === '' ? 'contained' : 'outlined'}
          color="primary"
        >
          All
        </Button>
        {alphabet.map((letter) => (
          <Button
            key={letter}
            onClick={() => onLetterSelect(letter)}
            variant={selectedLetter === letter ? 'contained' : 'outlined'}
            color="primary"
          >
            {letter}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default AlphabetFilter;