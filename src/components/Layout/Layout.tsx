/**
 * Layout.tsx
 *
 * This component provides a consistent layout structure for the application.
 * It renders a two-column layout with a sidebar and content area, along with
 * navigation breadcrumbs and sign in/out functionality.
 *
 * Key features:
 * - Renders sidebar and main content in a responsive layout
 * - Displays navigation breadcrumbs with current context
 * - Provides sign in/out functionality based on authentication state
 * - Resets organization context and fetches teams on mount
 * - Adapts to different screen sizes
 */

import { Box } from "@mui/material";
import { useAuth } from "../../contexts/Auth";
import React, { ReactNode, useEffect } from "react";
import { ArrowForwardIos } from "@mui/icons-material";
import Logout from "../../icons/Logout";
import { Link } from "react-router-dom";

/**
 * Props interface for the Layout component
 */
interface LayoutProps {
  sideBar?: ReactNode; // Content for the sidebar section
  content?: ReactNode; // Main content to display
  title?: {
    // Navigation title information
    title: string; // Primary title for breadcrumb navigation
    subTitle?: string; // Secondary title for breadcrumb navigation
  };
}

/**
 * Layout component that provides a consistent structure across the application
 *
 * @param sideBar - Content to render in the sidebar
 * @param content - Main content to render
 * @param title - Navigation title information for breadcrumbs
 */
const Layout: React.FC<LayoutProps> = ({ sideBar, content, title }) => {
  const {
    logout,
    user,
    currentOrganization,
    setCurrenOrganization,
    getMyTeams,
  } = useAuth();

  /**
   * Handles user logout by calling the logout function from Auth context
   */
  const handleLogout = async () => {
    await logout();
  };

  /**
   * Effect that runs on component mount to reset organization context
   * and fetch user's teams
   */
  useEffect(() => {
    if (currentOrganization) {
      setCurrenOrganization(undefined);
    }
    getMyTeams();
  }, []);

  return (
    <div className="p-0 md:p-4 font-Titles">
      <div className="flex flex-col justify-center md:flex-row">
        {/* Sidebar container */}
        <Box className="p-4 bg-[#f0f8fa] md:w-2/5 w-full flex flex-col gap-12 items-center">
          {/* Render sidebar content if provided */}
          {sideBar && (sideBar as React.ReactNode)}

          {/* Sign out button for authenticated users, sign in link for guests */}
          {user ? (
            <div
              className="flex items-center w-full gap-2 text-gray-500 cursor-pointer"
              onClick={handleLogout}
            >
              <Logout />
              <button>Sign Out</button>
            </div>
          ) : (
            <div
              className="flex items-center w-full gap-2 text-gray-500 cursor-pointer"
              onClick={handleLogout}
            >
              {" "}
              <Logout />
              <Link to="/login" className="text-gray-500">
                Sign In
              </Link>
            </div>
          )}
        </Box>

        {/* Main content container with scrolling */}
        <Box className="md:w-2/3 w-full bg-[#fcfbf7] flex flex-col max-h-[900px] h-dvh overflow-y-scroll custom-scrollbar justify-between p-4">
          <div className="">
            {/* Breadcrumb navigation */}
            <div className="flex items-center text-sm text-gray-400">
              {/* Main title with link to organizations management */}
              <Link
                to={"/organizations/manage"}
                className="mr-2"
                onClick={() => setCurrenOrganization(undefined)}
              >
                {title?.title}
              </Link>{" "}
              {/* Subtitle with appropriate links based on current path */}
              {title?.subTitle && (
                <>
                  <ArrowForwardIos className="!text-sm" />
                  {window.location.pathname.includes("manage") ? (
                    <Link
                      to={"/organizations/manage"}
                      className="mx-2 underline underline-offset-2"
                      onClick={() => setCurrenOrganization(undefined)}
                    >
                      {title?.subTitle}
                    </Link>
                  ) : window.location.pathname.includes("initiate") ? (
                    <Link
                      to={"/initiate"}
                      className="mx-2 underline underline-offset-2"
                      onClick={() => setCurrenOrganization(undefined)}
                    >
                      {title?.subTitle}
                    </Link>
                  ) : (
                    <span className="mx-2">{title?.subTitle}</span>
                  )}
                </>
              )}
              {/* Current organization in breadcrumb if applicable */}
              {currentOrganization &&
                window.location.pathname !== "/organizations/manage" && (
                  <div className="flex items-center gap-2">
                    <ArrowForwardIos className="!text-sm" />
                    <span className="mx-2">
                      {currentOrganization.organization.name}
                    </span>
                  </div>
                )}
            </div>

            {/* Render main content if provided */}
            <>{content && (content as React.ReactNode)}</>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Layout;
