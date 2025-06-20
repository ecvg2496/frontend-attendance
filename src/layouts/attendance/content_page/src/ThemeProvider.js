// ThemeProvider.js
import React, { createContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Step 1: Create a context for the color mode toggle
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function AppThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(() => ({
    toggleColorMode: () =>
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light')),
  }), []);

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
      },
    }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
