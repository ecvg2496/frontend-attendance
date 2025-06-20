import React, { createContext, useState } from 'react';

// Create a context for employee data
export const EmployeeContext = createContext();

// Create a provider component
export const EmployeeProvider = ({ children }) => {
  const [employee, setEmployee] = useState(null);

  return (
    <EmployeeContext.Provider value={{ employee, setEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};