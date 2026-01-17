import React, { useEffect } from "react";
import Routes from "./Routes";
import tokenRefreshService from "./services/auth/tokenRefreshService";

function App() {
  useEffect(() => {
    // Start automatic token refresh service on app mount
    const cleanup = tokenRefreshService.start();
    
    // Cleanup on unmount
    return () => {
      tokenRefreshService.stop();
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <Routes />
  );
}

export default App;
