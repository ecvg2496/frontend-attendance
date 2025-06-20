import React from "react";
import { styled } from "@mui/material/styles";

// Unified style definitions for both status and employment type
const badgeStyles = {
  // Status styles
  'active': { background: '#E8F5E9', text: '#2E7D32' },
  'holiday': { background: '#E3F2FD', text: '#1565C0' },
  'newly-hired': { background: '#E3F2FD', text: '#1565C0' },
  'training': { background: '#FFF8E1', text: '#FF8F00' },
  'floating': { background: '#FFF8E1', text: '#FF8F00' },
  'probation': { background: '#FFF8E1', text: '#FF8F00' },
  'on-leave': { background: '#FFF8E1', text: '#FF8F00' },
  'resigned': { background: '#FFEBEE', text: '#C62828' },
  'awol': { background: '#FFEBEE', text: '#C62828' },
  'terminated': { background: '#FFEBEE', text: '#C62828' },
  
  'regular': {
  background: '#E8F5E9', 
  text: '#1B5E20'         
  },
  'probationary': {
    background: '#FFF3E0',
    text: '#EF6C00'       
  },
  'contractual': {
    background: '#FFFDE7', 
    text: '#F9A825'       
  },
 'independent-contractor': {
  background: '#E1F5FE',
  text: '#0277BD'       
  },

  'full-time': {
    background: '#E8F5E9',
    text: '#1B5E20' 
  },
  'part-time': {
    background: '#FFF3E0', 
    text: '#EF6C00'
  },
  'contractual': {
    background: '#FFF3E0', 
    text: '#EF6C00'
  },

  // Default style
  'default': { background: '#F5F5F5', text: '#424242' }
};

const StyledBadge = styled('span')(({ theme, clickable }) => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '0.85rem',
  fontWeight: '500',
  cursor: clickable ? 'pointer' : 'default',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: clickable ? 'scale(1.05)' : 'none',
    boxShadow: clickable ? theme.shadows[1] : 'none'
  }
}));

const UniversalBadge = ({ status, type, clickable = false }) => {
  // Normalize the value by converting to lowercase and replacing spaces
  const normalizedValue = (status || type || '').toLowerCase().replace(/\s+/g, '-');
  const style = badgeStyles[normalizedValue] || badgeStyles.default;

  return (
    <StyledBadge 
      clickable={clickable}
      style={{
        backgroundColor: style.background,
        color: style.text
      }}
    >
      {status || type}
    </StyledBadge>
  );
};

export default UniversalBadge;
