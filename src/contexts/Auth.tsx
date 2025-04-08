/**
 * Auth.tsx
 *
 * This file implements the authentication and authorization context for the application.
 * It serves as a central state manager for user authentication, organization data,
 * and related application state.
 *
 * Key features:
 * - User authentication (login, logout, session persistence)
 * - Organization and team data management
 * - Survey and promise statistics tracking
 * - Toast notifications for user feedback
 * - API communication for auth-related operations
 */

import {
  useContext,
  createContext,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

/**
 * User interface defining the authenticated user structure
 */
export interface User {
  email: string;
  id: number;
  username: string;
  role: string;
  organization_id: number;
  organization: Organization;
}

/**
 * Organization data structure
 */
export interface Organization {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  logo: string;
}

/**
 * Team member data structure
 */
export interface Member {
  email: string;
  username: string;
  id: number;
}

/**
 * Team data structure with associated members
 */
export interface Team {
  id?: number;
  name: string;
  community: string;
  teamDescription: string;
  departmentName: string;
  mission: string;
  members: Member[];
  createdAt: string;
}
/**
 * Complete organization data including teams
 */
export interface OrganizationData {
  organization: Organization;
  teams: Team[];
}

/**
 * Statistics for survey completion by team
 */
export interface SurveyStats {
  team_id: number;
  total_users: number;
  remaining_users: number;
}

/**
 * Statistics for promise completion by team
 */
export interface PromiseStats {
  team_id: number;
  total_users: number;
  remaining_users: number;
}

/**
 * Trait wording data structure for surveys
 */
export type traitsWording = {
  traitId: number;
  traitName: string;
  traitWording: string;
  traitWordingRank: number;
};

/**
 * Promise data structure with associated user
 */
export interface PromiseType {
  id: number;
  promiseSessionId: number;
  userId: number;
  myPromise: string;
  difference: string;
  isAccepted: boolean;
  isPassed: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

/**
 * AuthContext provides authentication state and methods throughout the application
 */
export const AuthContext = createContext<{
  user: User | undefined; // Current authenticated user
  logout: () => void; // Logout function
  login: (email: string, password: string) => void; // Login function
  notifyLogin: (msg: string) => void; // Success notification
  notifyError: (msg: string) => void; // Error notification
  getOrganization: (id: number) => void; // Fetch organization data
  currentOrganization: OrganizationData; // Current organization data
  handleDeleteTeam: (id: number) => Promise<void>; // Delete team function
  setCurrenOrganization: React.Dispatch<any>; // Update organization state
  myTeams: any[]; // User's teams
  getMyTeams: () => void; // Fetch user's teams
  surveyStats: SurveyStats[]; // Survey completion statistics
  promiseStats: PromiseStats[]; // Promise completion statistics
  traitWordings: traitsWording[]; // Survey trait wordings
  acceptedPromises: PromiseType[]; // Accepted promises
  setAcceptedPromises: React.Dispatch<any>; // Update accepted promises
  fetchedOrg: boolean; // Organization fetch status
  currentOrganizationNotFound: boolean; // Organization not found status
  setCurrentOrganizationNotFound: React.Dispatch<any>; // Update organization not found status
  getPromises: (teamId: number) => void; // Fetch promises
  promises: any[]; // Promises
  getMyPromises: () => void; // Fetch my promises
  myPromises: any[]; // My promises
}>(null as any);

/**
 * AuthProvider component that wraps the application and provides authentication context
 *
 * Manages:
 * - User authentication state
 * - Organization and team data
 * - Survey and promise statistics
 * - API communication for authentication operations
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State management for user and related data
  const [user, setUser] = useState<User>();
  const [fetched, setFetched] = useState<boolean>(false);
  const [currentOrganization, setCurrenOrganization] = useState<
    any | undefined
  >(undefined);
  const [currentOrganizationNotFound, setCurrentOrganizationNotFound] =
    useState(false);
  const [surveyStats, setSurveyStats] = useState<SurveyStats[]>([]);
  const [promiseStats, setPromiseStats] = useState<PromiseStats[]>([]);
  const [myTeams, setMyTeams] = useState([]);
  const [traitWordings, setTraitWordings] = useState<traitsWording[]>([]);
  const [acceptedPromises, setAcceptedPromises] = useState<any[]>([]);
  const [promises, setPromises] = useState<any[]>([]);
  const [fetchedOrg, setFetchedOrg] = useState(false);
  const [myPromises, setMyPromises] = useState<any[]>([]);
  /**
   * Effect to check user authentication status and fetch trait wordings on component mount
   */
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await api.get("/api/v1/auth", {
          withCredentials: true,
        });
        if (typeof data === "object") {
          setUser(data);
        }
      } catch (error) {
        toast.error("Failed to fetch user");
      } finally {
        setFetched(true);
      }
    };
    const getTraitWordings = async () => {
      try {
        const response = await api.get("/api/v1/questions/getTraitsWording");
        setTraitWordings(response.data);
      } catch (error) {
        toast.error("Failed to fetch trait wordings");
      }
    };

    checkUser();
    getTraitWordings();
  }, []);

  /**
   * Fetches teams associated with the current user
   */
  const getMyTeams = async () => {
    try {
      const response = await api.get("/api/v1/team/getMyTeams");
      setMyTeams(response.data);
      // setMyTeams(response.data.teams);
    } catch (error) {
      toast.error("Failed to fetch teams");
    }
  };

  /**
   * Displays an error toast notification
   */
  const notifyError = (msg: string) =>
    toast.error(msg, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "dark",
    });

  /**
   * Displays a success toast notification for login
   */
  const notifyLogin = (msg: string) =>
    toast.success(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "dark",
    });

  /**
   * Logs out the current user by calling the logout API
   * and clearing the user state
   */
  const logout = async () => {
    try {
      await api.post(
        "/api/v1/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setUser(undefined);
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  /**
   * Authenticates a user with email and password
   * Sets the user state and displays a welcome notification on success
   */
  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post(
        "/api/v1/auth/login",
        { email, password },
        {
          withCredentials: true,
        }
      );
      setUser(data);
      notifyLogin("Welcome " + data.username);
    } catch (error: any) {
      notifyError(error.response.data.error);
    }
  };

  /**
   * Fetches organization data, including survey and promise statistics
   * Updates multiple state values with the retrieved data
   */
  const getOrganization = async (id: number) => {
    try {
      setFetchedOrg(false);
      const response = await api.get(`/api/v1/org/getOrganization?id=${id}`);
      setCurrenOrganization(response.data);
      // Get and store survey stats
      const latestSurveys = await api.get(
        `/api/v1/survey/organizationSurveys?organizationId=${id}`
      );
      setSurveyStats(latestSurveys.data);

      // Get and store promise stats
      const latestPromises = await api.get(
        `/api/v1/survey/organizationPromises?organizationId=${id}`
      );
      setPromiseStats(latestPromises.data.result);
      setAcceptedPromises(latestPromises.data.promisesResults);
    } catch (error) {
      setCurrentOrganizationNotFound(true);
    } finally {
      setFetchedOrg(true);
    }
  };

  /**
   * Deletes a team and updates the organization state
   * to remove the deleted team from the UI
   */
  const handleDeleteTeam = async (id: number) => {
    try {
      await api.delete("/api/v1/team/deleteTeam?teamId=" + id);
      setCurrenOrganization((prev: OrganizationData) => ({
        ...prev,
        teams: prev.teams.filter((team: Team) => team.id !== id),
      }));
    } catch (error) {
      toast.error("Failed to delete team");
    }
  };

  const getPromises = async (teamId: number) => {
    const response = await api.get(
      `/api/v1/survey/getAllTeamPromises?teamId=${teamId}`
    );
    setPromises(response.data.sortedPromises);
  };

  const getMyPromises = async () => {
    const response = await api.post("/api/v1/survey/getPromise", {
      teamIds: myTeams.map((item: any) => item.teams.id),
    });
    console.log(response);
    setMyPromises(response.data);
  };
  // Provide the authentication context to children components
  // Only render children once the initial auth check is complete
  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        login,
        notifyError,
        notifyLogin,
        getOrganization,
        currentOrganization,
        handleDeleteTeam,
        setCurrenOrganization,
        myTeams,
        getMyTeams,
        surveyStats,
        promiseStats,
        traitWordings,
        acceptedPromises,
        setAcceptedPromises,
        fetchedOrg,
        currentOrganizationNotFound,
        setCurrentOrganizationNotFound,
        getPromises,
        promises,
        getMyPromises,
        myPromises,
      }}
    >
      {fetched ? children : null}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the authentication context
 * Simplifies consuming the auth context in components
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Helper function to check if a user is authenticated
 * Returns true if a user is logged in, false otherwise
 */
export const authenticated = () => useAuth().user != null;
