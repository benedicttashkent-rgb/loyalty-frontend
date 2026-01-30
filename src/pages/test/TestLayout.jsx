import React from 'react';
import { Outlet } from 'react-router-dom';
import { TestModeProvider } from '../../context/TestModeContext';

const TestLayout = () => {
  return (
    <TestModeProvider>
      <div className="min-h-screen bg-background pb-20">
        {/* Demo mode banner */}
        <div
          className="sticky top-0 z-50 w-full py-2 px-4 text-center text-sm font-medium bg-amber-500/90 text-amber-950 shadow-md"
          role="banner"
        >
          🧪 Демо-режим — интерфейс без регистрации. Заказы и баллы не сохраняются.
        </div>
        <main>
          <Outlet />
        </main>
      </div>
    </TestModeProvider>
  );
};

export default TestLayout;
