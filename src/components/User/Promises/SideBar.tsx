/**
 * SideBar.tsx
 *
 * This component renders the sidebar navigation for regular users, displaying
 * their pending promises and surveys. It provides an interface for users to
 * access their assigned tasks.
 *
 * Key features:
 * - Displays the BCAT logo and branding
 * - Shows collapsible sections for promises and surveys
 * - Fetches and displays user-specific promises and surveys
 * - Provides notification indicators for new items
 * - Links to the appropriate detail pages for each item
 */

import { Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import Logo from "../../../imgs/BCAT_Logo_Final.svg";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../../utils/api";
import { useAuth } from "../../../contexts/Auth";
import { useSurvey } from "../../../contexts/Survey";
import { toast } from "react-toastify";

/**
 * UserSideBar component displays the navigation sidebar for regular users
 *
 * Shows:
 * - BCAT branding and logo
 * - Collapsible sections for promises and surveys
 * - Count indicators showing the number of pending items
 * - Links to individual promise and survey pages
 */
const UserSideBar = () => {
  const { myTeams } = useAuth();
  const { promisesResults, fetchPromisesResults } = useSurvey();
  console.log(myTeams);
  // State to track which sections are expanded/collapsed
  const [openSections, setOpenSections] = useState({
    promises: false,
    surveys: false,
    teams: false,
  });

  console.log(promisesResults);

  // State to store fetched promises and surveys
  const [promises, setPromises] = useState([]);
  const [surveys, setSurveys] = useState([]);

  /**
   * Toggles the expansion state of a section (promises or surveys)
   */
  const handleToggle = (section: any) => {
    setOpenSections((prev: any) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /**
   * Effect that fetches promises and surveys data when myTeams changes
   * - getPromises: Fetches promises assigned to the user's teams
   * - getSurveys: Fetches surveys assigned to the user
   * - fetchPromisesResults: Fetches promise results from the Survey context
   */
  useEffect(() => {
    const getPromises = async () => {
      try {
        const res = await api.post("/api/v1/survey/getPromise", {
          teamIds: myTeams.map((item) => item.teams.id),
        });
        setPromises(res.data);
      } catch (error) {
        toast.error("Error fetching promises");
      }
    };

    const getSurveys = async () => {
      try {
        const res = await api.get("/api/v1/survey/getSurvey");
        setSurveys(res.data);
        console.log(res);
      } catch (error) {
        toast.error("Error fetching surveys");
        console.log(error);
      }
    };

    getPromises();
    getSurveys();
    fetchPromisesResults();
  }, [myTeams]);

  return (
    <>
      {/* BCAT Logo and Branding */}
      <img src={Logo} height={"250px"} alt="" />
      <div className="w-full">
        <h1 className="w-full text-sm ">
          Brand and Culture Alignment Toolkit&reg;
        </h1>
        <h2 className="text-lg font-medium">Promises Session</h2>
      </div>

      {/* Navigation Menu */}
      <div className="w-full">
        <List className="flex-grow w-full !font-medium">
          {/* Promises Section */}
          <ListItemButton onClick={() => handleToggle("promises")}>
            <div className="flex items-center gap-2 w-fit">
              <ListItemText
                primary={
                  <span className="flex items-center">
                    Promises to make
                    {promises.length > 0 && (
                      <span className="ml-2 text-xs font-bold text-red-500">
                        (New!)
                      </span>
                    )}
                  </span>
                }
                className="flex-grow"
              />
              {/* Count badge with animation when items exist */}
              <div
                className={`flex items-center justify-center w-6 h-6 p-1 font-bold text-white rounded-md shadow-md bg-Turquoise ${
                  promises.length > 0 ? "animate-pulse" : ""
                }`}
              >
                {promises.length}
              </div>
            </div>
          </ListItemButton>

          {/* Collapsible list of promises */}
          <Collapse
            in={openSections.promises}
            timeout="auto"
            unmountOnExit
            className="ml-4"
          >
            <List component="div" disablePadding>
              {promises.map((promise: any) => (
                <Link
                  key={promise.promiseId}
                  className="w-full"
                  to={`/promises/${promise.promiseId}`}
                >
                  <ListItemButton className="pl-8 rounded-md hover:bg-gray-100">
                    <ListItemText primary={promise.team.name} />
                  </ListItemButton>
                </Link>
              ))}
            </List>
          </Collapse>

          {/* Surveys Section */}
          <ListItemButton onClick={() => handleToggle("surveys")}>
            <div className="flex items-center gap-2 w-fit">
              <ListItemText
                primary={
                  <span className="flex items-center">
                    Surveys
                    {surveys.length > 0 && (
                      <span className="ml-2 text-xs font-bold text-red-500">
                        (New!)
                      </span>
                    )}
                  </span>
                }
                className="flex-grow"
              />
              {/* Count badge with animation when items exist */}
              <div
                className={`flex items-center justify-center w-6 h-6 p-1 font-bold text-white rounded-md shadow-md bg-Turquoise ${
                  surveys.length > 0 ? "animate-pulse" : ""
                }`}
              >
                {surveys.length}
              </div>
            </div>
          </ListItemButton>

          {/* Collapsible list of surveys */}
          <Collapse
            in={openSections.surveys}
            timeout="auto"
            unmountOnExit
            className="ml-4"
          >
            <List component="div" disablePadding>
              {surveys.map((survey: any) => (
                <Link
                  key={survey.id}
                  className="w-full"
                  to={`/survey/${survey.id}`}
                >
                  <ListItemButton className="pl-8 rounded-md hover:bg-gray-100">
                    <ListItemText primary={survey.team.name} />
                  </ListItemButton>
                </Link>
              ))}
            </List>
          </Collapse>

          {/* My Teams Section - Replaced Promise Results */}
          <ListItemButton onClick={() => handleToggle("teams")}>
            <div className="flex items-center gap-2 w-fit">
              <ListItemText
                primary={<span className="flex items-center">My Teams</span>}
                className="flex-grow"
              />
              {/* Count badge for teams */}
              <div
                className={`flex items-center justify-center w-6 h-6 p-1 font-bold text-white rounded-md shadow-md bg-Turquoise`}
              >
                {myTeams?.length || 0}
              </div>
            </div>
          </ListItemButton>

          {/* Collapsible list of teams */}
          <Collapse
            in={openSections.teams}
            timeout="auto"
            unmountOnExit
            className="ml-4"
          >
            <List component="div" disablePadding>
              {myTeams?.map((team: any) => (
                <Link
                  key={team.teams.id}
                  className="w-full"
                  to={`/team-promises/${team.teams.id}`}
                >
                  <ListItemButton className="pl-8 rounded-md hover:bg-gray-100">
                    <ListItemText primary={team.teams.name} />
                  </ListItemButton>
                </Link>
              ))}
            </List>
          </Collapse>
        </List>
      </div>
    </>
  );
};

export default UserSideBar;
