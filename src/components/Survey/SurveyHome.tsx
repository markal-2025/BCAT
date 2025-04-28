/**
 * SurveyHome.tsx
 *
 * This component serves as the main container for the survey workflow, implementing
 * a multi-step form with a stepper interface to guide users through the survey process.
 * It controls navigation between different survey sections and manages the overall
 * survey experience.
 *
 * Key features:
 * - Three-step survey process with Material UI stepper for navigation
 * - Responsive design that adapts to mobile and desktop views
 * - Displays user information from authentication context
 * - Manages state transitions between survey steps
 * - Integrates with Survey context for data management
 */

import {
  Box,
  Step,
  StepLabel,
  Stepper,
  TextareaAutosize,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import Next from "../../icons/Next";
import Logo from "../../imgs/BCAT_Logo_Final.svg";
import { useAuth } from "../../contexts/Auth";
import Behaviour from "./Behaviour";
import DesiredSkills from "./DesiredSkills";
import { useSurvey } from "../../contexts/Survey";
import { ClipLoader } from "react-spinners";
import Logout from "../../icons/Logout";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/api";
import { toast } from "react-toastify";
/**
 * Survey steps configuration defining the structure of the survey process
 */
const steps = [
  {
    label: "General Information",
  },
  {
    label: "Favorable and Unfavorable Traits",
  },
  {
    label: "Desired Skill",
  },
];

/**
 * SurveyHome component that manages the complete survey experience
 *
 * This component:
 * 1. Displays a stepper UI showing progress through the survey
 * 2. Controls navigation between different survey steps
 * 3. Adapts layout for different screen sizes
 * 4. Shows appropriate content for each step
 */
const SurveyHome = () => {
  const [activeStep, setActiveStep] = useState(0); // Current survey step
  const { logout, user, myTeams } = useAuth(); // Auth context for user info
  const [popup, setPopup] = useState(true); // Controls visibility of popup
  const { loading, error, traits, selectedTraits, skills, selectedSkills } =
    useSurvey(); // Survey loading and error states
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile screens
  const [personalDetails, setPersonalDetails] = useState(false); // Controls visibility of personal details form
  const { teamId, surveyId } = useParams();
  const [surveyChecked, setSurveyChecked] = useState(false);
  const navigate = useNavigate();

  // Calculate total progress across both steps
  const getTotalProgress = () => {
    const totalQuestions = traits.length + skills.length;
    const answeredQuestions = selectedTraits.length + selectedSkills.length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  /**
   * Navigation functions to move between survey steps
   */
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handlePrev = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /**
   * Handles user logout by calling the logout function from auth context
   */
  const handleLogout = async () => {
    await logout();
  };
  useEffect(() => {
    const checkSurvey = async () => {
      if (surveyChecked) return; // Prevent multiple checks
      try {
        await api.get(`/api/v1/survey/checkSurvey?surveyId=${surveyId}`);
        setSurveyChecked(true);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(
            "Survey not found. Please ensure you are using the correct link."
          );
        }
        navigate("/");
      }
    };
    checkSurvey();
  }, []);

  return surveyChecked ? (
    <div className="relative flex flex-col w-full min-h-screen">
      {/* Enhanced Progress bar at the top */}
      {activeStep > 0 && (
        <div className="sticky top-0 z-50 w-full px-4 py-3 shadow-sm bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-Turquoise animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
            </div>
            <span className="text-sm font-semibold text-Turquoise">
              {Math.round(getTotalProgress())}%
            </span>
          </div>
          <div className="relative w-full h-3 overflow-hidden bg-gray-100 rounded-full">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${getTotalProgress()}%`,
                background: "linear-gradient(90deg, #0091AB 0%, #00B4D8 100%)",
                boxShadow: "0 0 10px rgba(0, 145, 171, 0.3)",
              }}
            />
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${getTotalProgress()}%`,
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)",
                transform: "translateX(-100%)",
                animation: "shimmer 2s infinite",
              }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col justify-start flex-grow w-full p-0 overflow-auto md:p-4 font-Titles">
        <div className="flex flex-col justify-start flex-grow w-full md:flex-row">
          {/* Left sidebar with logo, title and stepper */}
          <Box className="p-4 bg-[#f0f8fa] md:w-1/4 w-full flex flex-col gap-12 items-center">
            <img src={Logo} height={"250px"} alt="" />
            <div className="">
              <span>Brand and Culture Alignment Toolkit</span>
              <h1>Survey Instrument - BCAT</h1>
              <h1>Step One: Consonance</h1>
            </div>

            {/* Stepper component that adapts to screen size */}
            <Stepper
              activeStep={activeStep}
              orientation={isMobile ? "horizontal" : "vertical"}
              sx={{
                "& .MuiStepLabel-label": {
                  display: { xs: "none", sm: "block" },
                },
                ...(isMobile && {
                  flexWrap: "wrap",
                }),
              }}
            >
              {steps.map((step) => (
                <Step
                  sx={{
                    "& .MuiStepIcon": {
                      color: "#0091AB",
                    },
                  }}
                  key={step.label}
                >
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Logout button */}
            <div
              className="flex items-center w-full gap-2 text-gray-500 cursor-pointer"
              onClick={handleLogout}
            >
              <Logout />
              <button>Sign Out</button>
            </div>
          </Box>

          {/* Main content area that changes based on active step */}
          {activeStep === 0 && !personalDetails ? (
            <Box className="md:w-3/4 w-full bg-[#fcfbf7] flex flex-col justify-between p-4">
              {loading || error ? (
                <div className="flex items-center justify-center h-screen">
                  <ClipLoader color="#0091AB" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="mb-6 font-normal">
                      Before completing this BCAT Survey, please take a moment
                      to visualize your entire Team - its people, the tools and
                      methods it uses, its values and virtues - all of it as
                      though it were a single person doing its Best Work on its
                      Best Day to keep all of its promises and achieve all of
                      its goals.
                    </p>
                    <span className="text-sm ">
                      Use this online survey's three sections to describe
                      yourself and this "virtual person:"
                    </span>
                    <ol className="p-4 mt-4 list-decimal">
                      <li>General Information</li>
                      <li> Favorable and Unfavorable Traits</li>
                      <li>Desired Skills</li>
                    </ol>
                    <p>
                      Allow about 15 minutes of "quiet time" to consider and
                      complete all 3 sections. For best results, please work on
                      this alone, without discussing it with others until
                      everyone's completed it.
                    </p>
                    <div className="w-3/4 p-2 mt-8 mb-12 text-sm text-gray-400 border-2 border-red-600 rounded-lg">
                      Please answer each question in this section carefully,
                      keeping in mind that your BCAT reports will include the
                      information you provide exactly as you enter it.
                    </div>
                    <p className="my-12">
                      Survey items marked with an asterisk (*) require an
                      answer.
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-between md:flex-row">
                    <p className="text-sm text-gray-400">
                      Brand and Culture Alignment Toolkit and the BCAT logo are
                      registered trademarks .
                    </p>
                    <div className="flex justify-end w-full">
                      <button
                        onClick={() => setPersonalDetails(true)}
                        className="flex items-center justify-between px-4 py-1 font-normal text-white rounded-full bg-Turquoise"
                      >
                        Next <Next />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </Box>
          ) : personalDetails && activeStep === 0 ? (
            <Box className="md:w-3/4 w-full bg-[#fcfbf7] flex flex-col justify-between p-4">
              <form action="" className="flex flex-col justify-between h-full">
                <div className="p-6">
                  <label htmlFor="">Your Personal Details</label>
                  {/* Personal information section with auto-populated user data */}
                  <div className="flex flex-col gap-4 mt-4 md:flex-row">
                    <input
                      type="text"
                      className="px-3 py-1.5 md:w-1/2 w-full border rounded-lg outline-none border-Turquoise"
                      name="firstName"
                      placeholder="First Name"
                      disabled
                      value={user?.username.split(" ")[0]}
                    />
                    <input
                      className="px-3 py-1.5 md:w-1/2 w-full border rounded-lg outline-none border-Turquoise"
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      disabled
                      value={user?.username.split(" ")[1] || ""}
                    />
                  </div>
                  <div className="flex flex-col gap-4 mt-4 md:flex-row">
                    <input
                      type="text"
                      name="firstName"
                      className="px-3 py-1.5 md:w-1/2 w-full border rounded-lg outline-none border-Turquoise"
                      placeholder="Email Address"
                      disabled
                      value={user?.email}
                    />
                    <input
                      type="text"
                      name="lastName"
                      className="px-3 py-1.5 md:w-1/2 w-full border rounded-lg outline-none border-Turquoise"
                      placeholder="Company or Organization Name"
                      disabled
                      value={user?.organization?.name}
                    />
                  </div>

                  {/* Team information section - user input fields */}
                  <div className="flex flex-col gap-8 mt-6 md:flex-row">
                    <div className="flex flex-col justify-between w-full md:w-1/2">
                      <h2>The Name or identifier of Your Team </h2>
                      <span className="block w-full text-xs text-gray-400 md:w-1/2">
                        (30 chars max, e.g., Marketing Dept., Quality Control
                        Team ,Customer Support Group , Board of Directors)
                      </span>
                      <TextareaAutosize
                        className="w-full p-2 mt-2 border rounded-lg border-Turquoise "
                        aria-label="minimum height"
                        minRows={3}
                        disabled
                        value={
                          myTeams.find(
                            (team) => team.teams.id === parseInt(teamId || "0")
                          )?.teams.name
                        }
                        placeholder="Briefly describe your Team"
                      />
                    </div>
                    <div className="flex flex-col justify-between w-full md:w-1/2">
                      <h2>Describe your current role on this Team :</h2>
                      <TextareaAutosize
                        className="w-full p-2 mt-2 border rounded-lg border-Turquoise "
                        aria-label="minimum height"
                        minRows={3}
                        placeholder="Describe your current role on this Team"
                      />
                    </div>
                  </div>

                  {/* Community benefit section */}
                  <div className="mt-4">
                    <h2>
                      Describe the community who benefits (or will benefit) by
                      the successful completion of your Team's mission. How does
                      (or will) that community become better as a result?
                    </h2>
                    <TextareaAutosize
                      className="w-full p-2 mt-2 border rounded-lg border-Turquoise "
                      aria-label="minimum height"
                      minRows={3}
                    />
                  </div>
                </div>

                {/* Footer with navigation - positioned at bottom */}
                <div className="flex flex-col items-center justify-between p-4 mt-auto md:flex-row">
                  <p className="text-sm text-gray-400">
                    Brand and Culture Alignment Toolkit and the BCAT logo are
                    registered trademarks.
                  </p>
                  <div className="flex justify-end w-full">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleNext();
                        setPersonalDetails(false);
                      }}
                      className="flex items-center justify-between px-4 py-1 font-normal text-white rounded-full bg-Turquoise"
                    >
                      Next <Next />
                    </button>
                  </div>
                </div>
              </form>
            </Box>
          ) : null}

          {/* Step 1 - Traits and Behaviors section */}
          {activeStep === 1 && (
            <Box className="md:w-3/4 w-full bg-[#fcfbf7] flex flex-col justify-between p-4">
              <Behaviour
                popup={popup}
                setPopup={setPopup}
                handlePrev={handlePrev}
                handleNext={handleNext}
              />
            </Box>
          )}

          {/* Step 2 - Desired Skills section */}
          {activeStep === 2 && (
            <Box className="md:w-3/4 w-full bg-[#fcfbf7] flex flex-col justify-between p-4">
              <DesiredSkills handlePrev={handlePrev} />
            </Box>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center w-full h-screen">
      <ClipLoader color="#0091AB" />
    </div>
  );
};

export default SurveyHome;
