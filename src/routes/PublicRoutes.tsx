/**
 * PublicRoutes.tsx
 *
 * This file defines all public routes in the application that are accessible
 * without authentication. It serves as the entry point for unauthenticated users.
 *
 * Key features:
 * - Uses React Router for navigation
 * - Provides access to login and password reset functionality
 * - Implements lazy loading for the Login component to improve initial load time
 * - Redirects unknown routes to the login page
 */

import { Route, Routes, Navigate } from "react-router-dom";
import { lazy } from "react";
import CreateOrganization from "../components/Admin/Organization/CreateOrganization";
import SideBar from "../components/Admin/Organization/SideBar";
import Layout from "../components/Layout/Layout";
import ResetPassword from "../components/ResetPassword/ResetPassword";
// Lazy load Login component to improve initial page load performance
const Login = lazy(() => import("../components/Login/Login"));

/**
 * PublicRoutes component defines all routes that are accessible without authentication.
 *
 * Contains:
 * - Login page as the default route
 * - Organization creation page (using the shared Layout component)
 * - Password reset functionality accessed via email token
 * - Fallback redirect to login for any unmatched routes
 */
const PublicRoutes = () => {
  return (
    <Routes>
      {/* Default route - Login page */}
      <Route path="/" element={<Login />} />

      {/* Organization creation page with standard layout */}
      <Route
        path="/organizations/create"
        element={
          <Layout
            sideBar={<SideBar />}
            content={<CreateOrganization />}
            title={{
              title: "Organizations",
              subTitle: "Create a new organization",
            }}
          />
        }
      />

      {/* Password reset route with token parameter for validation */}
      <Route path="/resetPassword/:token" element={<ResetPassword />} />

      {/* Redirect any unmatched routes to the login page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PublicRoutes;
