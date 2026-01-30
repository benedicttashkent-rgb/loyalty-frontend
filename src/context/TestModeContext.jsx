import React, { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const TestModeContext = createContext(false);

export const useTestMode = () => useContext(TestModeContext);

export const TestModeProvider = ({ children }) => {
  const location = useLocation();
  const isTestMode = location.pathname.startsWith('/test');
  return (
    <TestModeContext.Provider value={isTestMode}>
      {children}
    </TestModeContext.Provider>
  );
};

export default TestModeContext;
