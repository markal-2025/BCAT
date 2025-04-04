/**
 * Survey.tsx
 *
 * This file implements the survey context for the application, managing the state
 * and functionality related to user surveys. It handles loading survey data,
 * tracking user selections, and submitting survey responses.
 *
 * Key features:
 * - Fetches and manages trait and skill data for surveys
 * - Tracks user selections for traits and skills
 * - Handles survey submission
 * - Provides error handling and loading states
 * - Randomizes the order of survey questions for unbiased responses
 */

import {
  useContext,
  createContext,
  type ReactNode,
  useEffect,
  useState,
  useRef,
} from "react";
import api from "../../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

/**
 * SurveyContext provides survey state and methods throughout the application
 *
 * Contains:
 * - Loading states for fetching and submitting
 * - Trait and skill data arrays
 * - User selection tracking
 * - Error handling
 * - Survey submission functionality
 */
export const SurveyContext = createContext<{
  loading: boolean; // Loading state for data fetching
  traits: { traitId: number; traitName: string }[]; // Available traits
  selectedTraits: { traitId: number; response: string }[]; // User-selected trait responses
  setSelectedTraits: React.Dispatch<
    React.SetStateAction<{ traitId: number; response: string }[]>
  >;
  skills: { skillId: number; skillName: string }[]; // Available skills
  selectedSkills: { desiredSkillId: number; response: string }[]; // User-selected skill responses
  setSelectedSkills: React.Dispatch<
    React.SetStateAction<{ desiredSkillId: number; response: string }[]>
  >;
  error: boolean; // Error state
  handleSubmitSurvey: () => void; // Survey submission function
  submitLoading: boolean; // Loading state during submission
  // Add new properties for promise results
  promisesResults: any[];
  loadingPromiseResults: boolean;
  fetchPromisesResults: () => Promise<void>;
}>(null as any);

/**
 * SurveyProvider component that wraps survey-related components and provides survey context
 *
 * Manages:
 * - Fetching survey data (traits and skills)
 * - Tracking user selections
 * - Handling survey submission
 * - Error handling and navigation
 */
export const SurveyProvider = ({ children }: { children: ReactNode }) => {
  // State for traits data and user selections
  const [traits, setTraits] = useState<
    { traitId: number; traitName: string }[]
  >([]);
  const { surveyId } = useParams<{ surveyId: string }>();

  // State for skills data and user selections
  const [skills, setSkills] = useState<
    { skillId: number; skillName: string }[]
  >([]);
  const [selectedSkills, setSelectedSkills] = useState<
    { desiredSkillId: number; response: string }[]
  >([]);
  const [selectedTraits, setSelectedTraits] = useState<
    { traitId: number; response: string }[]
  >([]);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  /**
   * Utility function to randomize array order
   * Used to randomize the presentation of traits and skills
   * to prevent order bias in survey responses
   */
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const [error, setError] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Reference to track if the error toast has been shown
  // to prevent duplicate error messages
  const hasRendered = useRef(false);

  // Add new state for promise results
  const [promisesResults, setPromisesResults] = useState<any[]>([]);
  const [loadingPromiseResults, setLoadingPromiseResults] = useState(false);

  /**
   * Effect to fetch traits and skills data when the component mounts
   * Handles error cases such as invalid survey IDs
   */
  useEffect(() => {
    const fetchTraits = async () => {
      try {
        const { data } = await api.get(
          `/api/v1/questions/getAllTraits?surveyId=${surveyId}`
        );
        // Only shuffle traits if user hasn't made any selections yet
        // This preserves order during page refreshes
        const shuffledTraits =
          selectedTraits.length > 0 ? data : shuffleArray(data);
        setTraits(shuffledTraits);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (!hasRendered.current) {
            if (error.response?.status === 404)
              toast.error(
                "Survey not found. Please ensure you are using the correct link.",
                {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: false,
                  theme: "dark",
                }
              );
            if (error.response?.status === 400)
              toast.error("Survey is not availble", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "dark",
              });
            hasRendered.current = true;
            setError(true);
            navigate("/");
          }
        }

        console.error("Failed to fetch traits:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSkills = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/v1/questions/getAllSkills");
        const shuffledSkills = shuffleArray(data);
        setSkills(shuffledSkills);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };

    fetchTraits();
    fetchSkills();
  }, []);

  /**
   * Handles survey submission by combining trait and skill responses
   * and sending them to the server, then navigating back to home
   */
  const handleSubmitSurvey = async () => {
    setSubmitLoading(true);
    const response = [...selectedTraits, ...selectedSkills];
    try {
      await api.post("/api/v1/survey/submitSurvey", {
        surveyId,
        responses: response,
      });
      toast.success("Survey submitted successfully");
      navigate("/");
    } catch (error) {
      console.error("Failed to submit survey:", error);
    } finally {
      setSubmitLoading(false);
      setSelectedTraits([]);
      setSelectedSkills([]);
    }
  };

  /**
   * Fetches the user's promise results history
   */
  const fetchPromisesResults = async () => {
    setLoadingPromiseResults(true);
    try {
      const res = await api.get("/api/v1/survey/getUserPromiseResponse");
      setPromisesResults(res.data);
    } catch (error) {
      toast.error("Error fetching promises results");
      console.error("Failed to fetch promise results:", error);
    } finally {
      setLoadingPromiseResults(false);
    }
  };

  return (
    <SurveyContext.Provider
      value={{
        loading,
        traits,
        selectedTraits,
        setSelectedTraits,
        skills,
        selectedSkills,
        setSelectedSkills,
        error,
        handleSubmitSurvey,
        submitLoading,
        // Add new properties to the context value
        promisesResults,
        loadingPromiseResults,
        fetchPromisesResults,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

/**
 * Custom hook to easily access the survey context
 * Simplifies consuming the context in survey-related components
 */
export const useSurvey = () => useContext(SurveyContext);
