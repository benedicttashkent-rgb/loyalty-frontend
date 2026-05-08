import React, { useEffect, useRef, useState } from "react";
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
          const order = data.order;
          let status = (order.status || '').toString().toUpperCase();
          if (status === 'GIVEN' || status === 'COMPLETED' || status === 'DELIVERED') status = 'CLOSED';
          
          // Use order_number from API to ensure consistency
          const actualOrderNumber = order.order_number || order.orderNumber || orderNumber;
          
          // Check if rating was already submitted
          const savedOrder = localStorage.getItem('benedictOrderDetails');
          let ratingSubmitted = false;
          if (savedOrder) {
            try {
              const parsed = JSON.parse(savedOrder);
              ratingSubmitted = parsed.ratingSubmitted === true;
            } catch (e) {
              // Ignore parsing errors
            }
          }
          
          // If rating was submitted, don't update status and hide button
          if (ratingSubmitted) {
            localStorage.removeItem('benedictOrderDetails');
            setOrderDetails({ orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null, ratingSubmitted: true });
            return;
          }
          
          // Update order status in state AND localStorage
          const updatedOrderDetails = {
            ...orderDetails,
            orderNumber: actualOrderNumber, // Use order_number from API
            status: status
          };
          setOrderDetails(updatedOrderDetails);
          
          // Update localStorage with new status and correct order number
          if (savedOrder) {
            try {
              const parsed = JSON.parse(savedOrder);
              parsed.status = status;
              parsed.orderNumber = actualOrderNumber; // Update with correct order number
              localStorage.setItem('benedictOrderDetails', JSON.stringify(parsed));
            } catch (e) {
              console.error('Error updating localStorage:', e);
            }
          }
          
          // When order is CLOSED: keep showing button so OrderStatusButton can show rating modal.
          // Only clear after user submits rating (handled in OrderStatusButton).
          if (status === 'CLOSED') {
            // Update state with CLOSED so modal shows "Выполнен" and rating can appear
            setOrderDetails(prev => ({
              ...prev,
              orderNumber: prev.orderNumber || actualOrderNumber,
              status: 'CLOSED',
              estimatedTime: prev.estimatedTime,
              branch: prev.branch,
              comments: prev.comments || {}
            }));
            if (savedOrder) {
              try {
                const parsed = JSON.parse(savedOrder);
                parsed.status = 'CLOSED';
                parsed.orderNumber = actualOrderNumber;
                localStorage.setItem('benedictOrderDetails', JSON.stringify(parsed));
              } catch (e) {
                console.error('Error updating localStorage:', e);
              }
            }
            return;
          }
          
          // If order is CANCELLED, remove from localStorage
          if (status === 'CANCELLED') {
            localStorage.removeItem('benedictOrderDetails');
            setOrderDetails({ orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null });
            return;
          }
        }
      } else if (response.status === 404) {
        console.warn('Order not found in backend, clearing');
        localStorage.removeItem('benedictOrderDetails');
        setOrderDetails({ orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null });
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      // Non-blocking: continue showing button even if status check fails
    }
  };

  const statusIntervalRef = useRef(null);
  const orderNumberRef = useRef(orderDetails.orderNumber);

  // Keep ref in sync so the interval callback always has the latest orderNumber
  useEffect(() => {
    orderNumberRef.current = orderDetails.orderNumber;
  }, [orderDetails.orderNumber]);

  useEffect(() => {
    // Start automatic token refresh service on app mount
    const cleanup = tokenRefreshService.start();

    // Cross-tab sync via storage event — no API call, just state update
    const handleStorageChange = (e) => {
      if (e.key === 'benedictOrderDetails') {
        try {
          const newOrder = e.newValue
            ? JSON.parse(e.newValue)
            : { orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null };
          setOrderDetails(newOrder);
        } catch (error) {
          console.error('Error parsing order details:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Same-tab localStorage poll — only syncs state, never calls API
    const checkInterval = setInterval(() => {
      try {
        const saved = localStorage.getItem('benedictOrderDetails');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.orderNumber && parsed.orderNumber !== orderNumberRef.current) {
            setOrderDetails(parsed);
          }
        } else if (orderNumberRef.current) {
          setOrderDetails({ orderNumber: '', estimatedTime: '', branch: null, comments: {}, status: null });
        }
      } catch {
        // Ignore parsing errors
      }
    }, 500);

    return () => {
      tokenRefreshService.stop();
      if (cleanup) cleanup();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []); // runs once on mount

  // Separate effect for API polling — recreates interval only when orderNumber changes
  useEffect(() => {
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);

    if (!orderDetails.orderNumber) return;

    // Initial check immediately
    checkOrderStatus(orderDetails.orderNumber);

    // Poll every 15s instead of 5s — reduces backend load by 3×
    statusIntervalRef.current = setInterval(() => {
      checkOrderStatus(orderDetails.orderNumber);
    }, 15000);

    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, [orderDetails.orderNumber]);

  // Show button if order exists, not CANCELLED, and rating not yet submitted.
  // Keep showing when status is CLOSED so user can open and see rating modal.
  const shouldShowButton = orderDetails?.orderNumber && 
    orderDetails.status !== 'CANCELLED' &&
    !orderDetails.ratingSubmitted;

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
          orderType={orderDetails.orderType || 'takeaway'}
          deliveryAddress={orderDetails.deliveryAddress || null}
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
