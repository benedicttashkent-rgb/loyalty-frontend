import React, { useEffect, useState } from "react";
import Routes from "./Routes";
import tokenRefreshService from "./services/auth/tokenRefreshService";
import OrderStatusButton from "./pages/food-ordering-menu/components/OrderStatusButton";
import { getApiUrl } from "./config/api";

function App() {
  // Global order status - load from localStorage and sync across pages
  const [orderDetails, setOrderDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('benedictOrderDetails');
      return saved ? JSON.parse(saved) : { orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null };
    } catch {
      return { orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null };
    }
  });

  // Check order status from API
  const checkOrderStatus = async (orderNumber) => {
    if (!orderNumber) return;
    
    try {
      const response = await fetch(getApiUrl(`orders/status/${orderNumber}`));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.order) {
          const status = data.order.status;
          // Update order status in state AND localStorage
          const updatedOrderDetails = {
            ...orderDetails,
            status: status
          };
          setOrderDetails(updatedOrderDetails);
          
          // Update localStorage with new status
          const savedOrder = localStorage.getItem('benedictOrderDetails');
          if (savedOrder) {
            try {
              const parsed = JSON.parse(savedOrder);
              parsed.status = status;
              localStorage.setItem('benedictOrderDetails', JSON.stringify(parsed));
            } catch (e) {
              console.error('Error updating localStorage:', e);
            }
          }
          
          // If order is CLOSED, show rating modal (don't remove immediately)
          if (status === 'CLOSED') {
            // Keep order details for rating modal
            // Will be removed after rating is submitted or modal is closed
            return;
          }
          
          // If order is CANCELLED, remove from localStorage
          if (status === 'CANCELLED') {
            localStorage.removeItem('benedictOrderDetails');
            setOrderDetails({ orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null });
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      // Non-blocking: continue showing button even if status check fails
    }
  };

  useEffect(() => {
    // Start automatic token refresh service on app mount
    const cleanup = tokenRefreshService.start();
    
    // Listen for order updates from localStorage (when order is placed on order page)
    const handleStorageChange = (e) => {
      if (e.key === 'benedictOrderDetails') {
        try {
          const newOrder = e.newValue ? JSON.parse(e.newValue) : { orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null };
          setOrderDetails(newOrder);
          // Check status when order is loaded
          if (newOrder.orderNumber) {
            checkOrderStatus(newOrder.orderNumber);
          }
        } catch (error) {
          console.error('Error parsing order details:', error);
        }
      }
    };

    // Listen for storage events (when localStorage changes in other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    
    // Check order status periodically if order exists
    const statusCheckInterval = orderDetails?.orderNumber ? setInterval(() => {
      checkOrderStatus(orderDetails.orderNumber);
    }, 5000) : null; // Check every 5 seconds
    
    // Also check localStorage periodically (for same-tab updates)
    const checkInterval = setInterval(() => {
      try {
        const saved = localStorage.getItem('benedictOrderDetails');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.orderNumber && parsed.orderNumber !== orderDetails.orderNumber) {
            setOrderDetails(parsed);
            checkOrderStatus(parsed.orderNumber);
          }
        } else if (orderDetails.orderNumber) {
          // Order was cleared
          setOrderDetails({ orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null });
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }, 500); // Check every 500ms for immediate updates

    // Initial status check if order exists
    if (orderDetails?.orderNumber) {
      checkOrderStatus(orderDetails.orderNumber);
    }
    
    // Cleanup on unmount
    return () => {
      tokenRefreshService.stop();
      if (cleanup) cleanup();
      window.removeEventListener('storage', handleStorageChange);
      if (statusCheckInterval) clearInterval(statusCheckInterval);
      clearInterval(checkInterval);
    };
  }, [orderDetails.orderNumber]);

  // Show button if order exists and status is NOT CANCELLED
  // Keep showing for CLOSED until rating is submitted
  const shouldShowButton = orderDetails?.orderNumber && 
    orderDetails.status !== 'CANCELLED';

  return (
    <>
      <Routes />
      {/* Global Order Status Button - shows on all pages when order is active and not completed */}
      {shouldShowButton && (
        <OrderStatusButton
          orderNumber={orderDetails.orderNumber}
          estimatedTime={orderDetails.estimatedTime}
          branch={orderDetails.branch}
          status={orderDetails.status}
          onClose={() => {
            const emptyOrder = { orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null };
            setOrderDetails(emptyOrder);
            localStorage.removeItem('benedictOrderDetails');
          }}
        />
      )}
    </>
  );
}

export default App;
