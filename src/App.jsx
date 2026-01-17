import React, { useEffect, useState } from "react";
import Routes from "./Routes";
import tokenRefreshService from "./services/auth/tokenRefreshService";
import OrderStatusButton from "./pages/food-ordering-menu/components/OrderStatusButton";

function App() {
  // Global order status - load from localStorage and sync across pages
  const [orderDetails, setOrderDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('benedictOrderDetails');
      return saved ? JSON.parse(saved) : { orderNumber: '', estimatedTime: '', branch: null, comments: {} };
    } catch {
      return { orderNumber: '', estimatedTime: '', branch: null, comments: {} };
    }
  });

  useEffect(() => {
    // Start automatic token refresh service on app mount
    const cleanup = tokenRefreshService.start();
    
    // Listen for order updates from localStorage (when order is placed on order page)
    const handleStorageChange = (e) => {
      if (e.key === 'benedictOrderDetails') {
        try {
          const newOrder = e.newValue ? JSON.parse(e.newValue) : { orderNumber: '', estimatedTime: '', branch: null, comments: {} };
          setOrderDetails(newOrder);
        } catch (error) {
          console.error('Error parsing order details:', error);
        }
      }
    };

    // Listen for storage events (when localStorage changes in other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage periodically (for same-tab updates)
    const checkInterval = setInterval(() => {
      try {
        const saved = localStorage.getItem('benedictOrderDetails');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.orderNumber && parsed.orderNumber !== orderDetails.orderNumber) {
            setOrderDetails(parsed);
          }
        } else if (orderDetails.orderNumber) {
          // Order was cleared
          setOrderDetails({ orderNumber: '', estimatedTime: '', branch: null, comments: {} });
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }, 500); // Check every 500ms for immediate updates
    
    // Cleanup on unmount
    return () => {
      tokenRefreshService.stop();
      if (cleanup) cleanup();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [orderDetails.orderNumber]);

  return (
    <>
      <Routes />
      {/* Global Order Status Button - shows on all pages when order is active */}
      {orderDetails?.orderNumber && (
        <OrderStatusButton
          orderNumber={orderDetails.orderNumber}
          estimatedTime={orderDetails.estimatedTime}
          branch={orderDetails.branch}
          onClose={() => {
            const emptyOrder = { orderNumber: '', estimatedTime: '', branch: null, comments: {} };
            setOrderDetails(emptyOrder);
            localStorage.removeItem('benedictOrderDetails');
          }}
        />
      )}
    </>
  );
}

export default App;
