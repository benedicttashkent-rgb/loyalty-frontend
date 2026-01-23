import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import HomeDashboard from './pages/home-dashboard';
import FoodOrderingMenu from './pages/food-ordering-menu';
import AboutBranchLocations from './pages/about-branch-locations';
import UserProfileManagement from './pages/user-profile-management';
import RewardsCatalog from './pages/rewards-catalog';
import PromotionsPage from './pages/promotions-page';
import SignupPage from './pages/signup';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomersEditor from './pages/admin/CustomersEditor';
import NewsBannerEditor from './pages/admin/NewsBannerEditor';
import RewardsEditor from './pages/admin/RewardsEditor';
import EventsEditor from './pages/admin/EventsEditor';
import TelegramBroadcastEditor from './pages/admin/TelegramBroadcastEditor';
import MenuItemsEditor from './pages/admin/MenuItemsEditor';
import CategoriesEditor from './pages/admin/CategoriesEditor';
import TelegramTest from './pages/telegram-test';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/home-dashboard" element={<HomeDashboard />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/telegram-test" element={<TelegramTest />} />
        <Route path="/food-ordering-menu" element={<FoodOrderingMenu />} />
        <Route path="/about-branch-locations" element={<AboutBranchLocations />} />
        <Route path="/user-profile-management" element={<UserProfileManagement />} />
        <Route path="/rewards-catalog" element={<RewardsCatalog />} />
        <Route path="/promotions-page" element={<PromotionsPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<CustomersEditor />} />
          <Route path="news" element={<NewsBannerEditor />} />
          <Route path="menu-items" element={<MenuItemsEditor />} />
          <Route path="categories" element={<CategoriesEditor />} />
          <Route path="rewards" element={<RewardsEditor />} />
          <Route path="events" element={<EventsEditor />} />
          <Route path="broadcast" element={<TelegramBroadcastEditor />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;