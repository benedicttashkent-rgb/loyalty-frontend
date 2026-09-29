import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Team from './pages/team';
import FoodOrderingMenu from './pages/food-ordering-menu';
import CheckoutPage from './pages/food-ordering-menu/CheckoutPage';
import AboutBranchLocations from './pages/about-branch-locations';
import UserProfileManagement from './pages/user-profile-management';
import RewardsCatalog from './pages/rewards-catalog';
import PromotionsPage from './pages/promotions-page';
import SignupPage from './pages/signup';
import TelegramTest from './pages/telegram-test';
import PaymentReturn from './pages/payment-return';
import LogoLoader from './components/LogoLoader';
import TabLayout from './components/navigation/TabLayout';

// Admin panel is a separate chunk — not needed by any public-facing page.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CustomersEditor = lazy(() => import('./pages/admin/CustomersEditor'));
const NewsBannerEditor = lazy(() => import('./pages/admin/NewsBannerEditor'));
const RewardsEditor = lazy(() => import('./pages/admin/RewardsEditor'));
const EventsEditor = lazy(() => import('./pages/admin/EventsEditor'));
const TelegramBroadcastEditor = lazy(() => import('./pages/admin/TelegramBroadcastEditor'));
const SpecialOffersEditor = lazy(() => import('./pages/admin/SpecialOffersEditor'));
const MenuItemsEditor = lazy(() => import('./pages/admin/MenuItemsEditor'));
const CategoriesEditor = lazy(() => import('./pages/admin/CategoriesEditor'));
const PromoCodesEditor = lazy(() => import('./pages/admin/PromoCodesEditor'));
const MarketingLinksEditor = lazy(() => import('./pages/admin/MarketingLinksEditor'));

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public Routes */}
        {/* Tab pages share one layout so the bottom tab bar stays mounted between them */}
        <Route element={<TabLayout />}>
          {/* The center tab (offers, news, events) is the main page */}
          <Route path="/" element={<PromotionsPage />} />
          {/* Old home URL — still linked from admin-configured buttons and saved bookmarks */}
          <Route path="/home-dashboard" element={<PromotionsPage />} />
          <Route path="/promotions-page" element={<PromotionsPage />} />
          <Route path="/promotions-page/:newsId" element={<PromotionsPage />} />
          <Route path="/team" element={<Team />} />
          <Route path="/rewards-catalog" element={<RewardsCatalog />} />
          <Route path="/food-ordering-menu" element={<FoodOrderingMenu />} />
          <Route path="/about-branch-locations" element={<AboutBranchLocations />} />
        </Route>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/telegram-test" element={<TelegramTest />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/return" element={<PaymentReturn />} />
        <Route path="/user-profile-management" element={<UserProfileManagement />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={
          <Suspense fallback={<LogoLoader fullscreen />}><AdminLogin /></Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<LogoLoader fullscreen />}><AdminLayout /></Suspense>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="customers" element={<CustomersEditor />} />
          <Route path="news" element={<NewsBannerEditor />} />
          <Route path="menu-items" element={<MenuItemsEditor />} />
          <Route path="categories" element={<CategoriesEditor />} />
          <Route path="rewards" element={<RewardsEditor />} />
          <Route path="events" element={<EventsEditor />} />
          <Route path="broadcast" element={<TelegramBroadcastEditor />} />
          <Route path="special-offers" element={<SpecialOffersEditor />} />
          <Route path="promo-codes" element={<PromoCodesEditor />} />
          <Route path="links" element={<MarketingLinksEditor />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;