import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomTabNavigation from './BottomTabNavigation';

// Layout for the tab pages. The tab bar lives here so it stays mounted while
// switching tabs; only the page content fades in.
// Opacity only — a transform here would break position:fixed inside pages.
const TabLayout = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  return (
    <>
      <div key={location.pathname} className="page-enter">
        <Outlet context={{ setCartCount }} />
      </div>
      <BottomTabNavigation cartCount={cartCount} />
    </>
  );
};

export default TabLayout;
