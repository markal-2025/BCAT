/**
 * PrivateRoutes.tsx
 *
 * This file defines all authenticated routes in the application, with different paths
 * accessible based on user roles (admin vs regular users).
 *
 * Key features:
 * - Uses React Router for navigation
 * - Implements lazy loading for components to improve initial load time
 * - Enforces role-based access control
 * - Maintains consistent layout structure across routes
 */

import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
import { SurveyProvider } from "../contexts/Survey";

// Lazy load components to improve initial page load performance
const SurveyHome = lazy(() => import("../components/Survey/SurveyHome"));
const Layout = lazy(() => import("../components/Layout/Layout"));
const SideBar = lazy(() => import("../components/Admin/Organization/SideBar"));
const UserSideBar = lazy(() => import("../components/User/Promises/SideBar"));
const CreateOrganization = lazy(
  () => import("../components/Admin/Organization/CreateOrganization")
);
const ManageOrganization = lazy(
  () => import("../components/Admin/Organization/ManageOrganization")
);
const OrganizationDetails = lazy(
  () => import("../components/Admin/Organization/OrganizationDetails")
);
const Promise = lazy(() => import("../components/User/Promises/Promise"));
const InitiatePromises = lazy(
  () => import("../components/Admin/Initiate/InitiatePromises")
);
const Organizations = lazy(
  () => import("../components/Admin/Initiate/Organizations")
);
const PromiseResults = lazy(
  () => import("../components/Admin/Results/Promise/PromisesResults")
);
const TeamDetails = lazy(() => import("../components/Admin/Team/TeamDetails"));
import { useAuth } from "../contexts/Auth";
const Teams = lazy(() => import("../components/Admin/Initiate/Teams"));
const SurveyResults = lazy(
  () => import("../components/Admin/Results/Survey/SurveyResults")
);
const AllPromises = lazy(
  () => import("../components/Admin/Results/Promise/AllPromises")
);
const UserPromisesResults = lazy(
  () => import("../components/User/Promises/UserPromisesResults")
);
const TeamPromises = lazy(
  () => import("../components/User/Promises/TeamPromises")
);

/**
 * PrivateRoutes component manages all authenticated routes and implements
 * role-based access control based on the user's role (admin vs regular user).
 *
 * - Admins have access to organization management, team management, and results views
 * - Regular users have access to promises and surveys assigned to them
 *
 * All routes use a consistent Layout component that includes a sidebar and content area.
 */
const PrivateRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ADMIN ROUTES - Only accessible to users with the admin role */}
      {user?.role === "admin" ? (
        <>
          {/* Commented out default route 
          <Route
            path="/"
            element={
              <Layout
                sideBar={<SideBar />}
                content={
                  <div>
                    <img src={Logo} alt="logo" />
                  </div>
                }
              />
            }
          /> */}

          {/* Organization Management Routes */}
          <Route
            path="/organizations/manage"
            element={
              <Layout
                sideBar={<SideBar />}
                content={<ManageOrganization />}
                title={{
                  title: "Manage",
                  subTitle: "Organizations",
                }}
              />
            }
          />
          <Route
            path="/organizations/manage/:id"
            element={
              <Layout
                sideBar={<SideBar />}
                content={<OrganizationDetails />}
                title={{
                  title: "Manage",
                  subTitle: "Organizations",
                }}
              />
            }
          />
          <Route
            path="/organizations/manage/:id/:teamId"
            element={
              <Layout
                sideBar={<SideBar />}
                content={<TeamDetails />}
                title={{
                  title: "Manage",
                  subTitle: "Organizations",
                }}
              />
            }
          />

          {/* Organization Creation Route */}
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

          {/* Promise Session Initiation Routes */}
          <Route
            path="/initiate"
            element={
              <Layout
                sideBar={<SideBar />}
                content={<InitiatePromises />}
                title={{
                  title: "Organizations",
                  subTitle: "Initiate a new promise session",
                }}
              />
            }
          />
          <Route
            path="/initiate/organizations"
            element={
              <Layout
                sideBar={<SideBar />}
                content={<Organizations />}
                title={{
                  title: "Organizations",
                  subTitle: "Initiate a new promise session",
                }}
              />
            }
          />
          <Route
            path="/initiate/:id"
            element={
              <Layout
                sideBar={<SideBar />}
                content={<Teams />}
                title={{
                  title: "Organizations",
                  subTitle: "Initiate a new promise session",
                }}
              />
            }
          />

          {/* Default redirect for admin users to the organization management page */}
          <Route
            path="*"
            element={<Navigate to="/organizations/manage" replace />}
          />
        </>
      ) : (
        <Route
          element={
            <SurveyProvider>
              {user?.role !== "admin" && <Outlet />}
            </SurveyProvider>
          }
        >
          {/* REGULAR USER ROUTES - For non-admin users */}
          <Route
            path="/"
            element={
              <Layout
                sideBar={<UserSideBar />}
                title={{
                  title: "Home",
                  subTitle: "Welcome to BCAT",
                }}
                content={
                  <div className="flex flex-col items-center justify-center max-w-4xl px-4 mx-auto mt-12 space-y-6">
                    <h1 className="text-3xl font-bold">Hi {user?.username}</h1>
                    <div className="text-center">
                      <h2 className="mb-4 text-2xl font-semibold">
                        About BCAT
                      </h2>
                      <p className="mb-4 text-lg">
                        BCAT (Brand and Culture Alignment Toolkit) helps
                        organizations align their team members with their core
                        values and mission.
                      </p>
                      <p className="mb-4 text-lg">
                        When we align the way we do our work (our Brand) with
                        our passion for the work we do (our Culture), we
                        communicate more openly and collaborate more willingly
                        with each other, our clients, and our partners in our
                        shared pursuit of excellence.
                      </p>
                      <p className="mb-4 text-lg">
                        Through surveys and promise sessions, BCAT helps teams
                        discover their shared values and make personal
                        commitments to embody those values in their daily work.
                      </p>
                      <div className="p-6 mt-6 border border-blue-200 rounded-lg bg-blue-50">
                        <h3 className="mb-3 text-xl font-semibold text-blue-800">
                          Your BCAT Journey
                        </h3>
                        <p className="mb-3 text-md">
                          As a member of your organization, you'll participate
                          in:
                        </p>
                        <ul className="space-y-2 text-left list-disc list-inside">
                          <li>
                            <span className="font-medium">Surveys</span> - Share
                            your perspective on your organization's brand and
                            culture
                          </li>
                          <li>
                            <span className="font-medium">
                              Promise Sessions
                            </span>{" "}
                            - Make personal commitments that align with your
                            organization's values
                          </li>
                          <li>
                            <span className="font-medium">Team Alignment</span>{" "}
                            - Collaborate with colleagues to strengthen your
                            shared culture
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                }
              />
            }
          />
          <Route
            path="/promises/:promiseId"
            element={
              <Layout
                sideBar={<UserSideBar />}
                content={<Promise />}
                title={{
                  title: "Promises to make",
                  subTitle: "Submit Promise",
                }}
              />
            }
          />

          {/* New route for viewing promise results */}
          <Route
            path="/promise-results/:promiseResultId"
            element={
              <Layout
                sideBar={<UserSideBar />}
                content={<UserPromisesResults />}
                title={{
                  title: "Promise History",
                  subTitle: "View Promise Details",
                }}
              />
            }
          />

          {/* New route for viewing team promises - wrapped in SurveyProvider */}
          <Route
            path="/team-promises/:teamId"
            element={
              <SurveyProvider>
                <Layout
                  sideBar={<UserSideBar />}
                  content={<TeamPromises />}
                  title={{
                    title: "Team Promises",
                    subTitle: "View Promise Sessions",
                  }}
                />
              </SurveyProvider>
            }
          />
        </Route>
      )}

      {/* SHARED ROUTES - Accessible regardless of user role */}
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
      <Route
        path="/promises/:promiseId"
        element={
          <SurveyProvider>
            <Layout
              sideBar={<UserSideBar />}
              content={<Promise />}
              title={{
                title: "Promises to make",
                subTitle: "Submit Promise",
              }}
            />
          </SurveyProvider>
        }
      />

      {/* Survey Routes - Uses SurveyProvider context to manage survey state */}
      <Route
        path="/survey/:surveyId"
        element={
          <SurveyProvider>
            <SurveyHome />{" "}
          </SurveyProvider>
        }
      />

      {/* Results Routes - For viewing survey and promise results */}
      <Route
        path="/surveyResult/:teamId/:surveyId"
        element={
          <Layout
            sideBar={<SideBar />}
            content={<SurveyResults />}
            title={{
              title: "Survey Results",
              subTitle: "Survey Results",
            }}
          />
        }
      />
      <Route
        path="/organizations/:organizationId/teams/:teamId/promises/:promiseId"
        element={
          <Layout
            sideBar={<SideBar />}
            content={<PromiseResults />}
            title={{
              title: "Promise Results",
            }}
          />
        }
      />
      <Route
        path="/organizations/:organizationId/teams/:teamId/promises"
        element={
          <Layout
            sideBar={<SideBar />}
            content={<AllPromises />}
            title={{
              title: "All Promises",
            }}
          />
        }
      />

      {/* Default redirect to home page for any unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PrivateRoutes;
