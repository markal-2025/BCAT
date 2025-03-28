import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../../../../utils/api";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import CustomChart from "./charts/CustomChart";
import { ClipLoader } from "react-spinners";
import CustomBarChart from "./charts/CustomBarChart";
import CombinedTraitBarChart from "./charts/CustomTraitBarChart";
import UsersSkillsRankingTable from "./UsersSkillsRankingTable";
import PDFExportButton from "./PDFExportButton";
import ConsonanceBarChart from "./charts/ConsonanceBarChart";
import ResonanceBarChart from "./charts/ResonanceBarChart";
import { Organization, useAuth } from "../../../../contexts/Auth";
// Import other components and types as in your original file
export type CompositeResult = {
  id: number;
  precisionScoreRaw: number;
  resolveScoreRaw: number;
  innovationScoreRaw: number;
  harmonyScoreRaw: number;
  precisionRank: number;
  resolveRank: number;
  innovationRank: number;
  harmonyRank: number;
  precisionAdjScore: number;
  resolveAdjScore: number;
  innovationAdjScore: number;
  harmonyAdjScore: number;
  aggregatedRank1: string;
  aggregatedRank12: string;
  aggregatedRank123: string;
  rAVG: number;
  rTGT: number;
  consonance: number;
  resonance: number;
  indexOfAllignment: number;
  phRI: number;
  prHI: number;
  rhPI: number;
  isComposite: boolean;
  isRoleTarget: boolean | null;
  userId: number | null;
  surveyId: number;
  team: {
    id: number;
    name: string;
    organization: {
      name: string;
    };
  };
  createdAt: string;
};
export type UserResult = {
  id: number;
  precisionScoreRaw: number;
  resolveScoreRaw: number;
  innovationScoreRaw: number;
  harmonyScoreRaw: number;
  precisionRank: number;
  resolveRank: number;
  innovationRank: number;
  harmonyRank: number;
  precisionAdjScore: number;
  resolveAdjScore: number;
  innovationAdjScore: number;
  harmonyAdjScore: number;
  aggregatedRank1: string;
  aggregatedRank12: string;
  aggregatedRank123: string;
  rAVG: number;
  rTGT: number;
  consonance: number;
  resonance: number;
  indexOfAllignment: number;
  phRI: number;
  prHI: number;
  rhPI: number;
  isComposite: boolean | null;
  isRoleTarget: boolean | null;
  userId: number;
  surveyId: number;
  teamId: number;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    password: string;
    organization_id: number | null;
    createdAt: string;
    is_deleted: boolean;
  };
  survey: {
    id: number;
    title: string;
    description: string;
    teamId: number;
    created_by: number;
    is_completed: boolean;
    is_deleted: boolean;
    createdAt: string;
  };
  team: {
    id: number;
    name: string;
    teamMission: string | null;
    teamDescription: string | null;
    sponsorFirstName: string | null;
    sponsorLastName: string | null;
    sponsorEmail: string | null;
    contactEmail: string | null;
    contactFirstName: string | null;
    contactLastName: string | null;
    teamLogo: string | null;
    organization_id: number;
    is_deleted: boolean;
    createdAt: string;
  };
};

/**
 * Represents the response format for individual user survey results
 */
export type UsersResultsResponse = Array<{
  id: number;
  user: {
    id: number;
    username: string;
  };
  precisionRank: number;
  resolveRank: number;
  harmonyRank: number;
  innovationRank: number;
  precisionAdjScore: number;
  resolveAdjScore: number;
  harmonyAdjScore: number;
  innovationAdjScore: number;
  aggregatedRank123: string;
  // ... other properties ...
}>;

/**
 * Main component for displaying survey results
 *
 * Handles fetching and displaying survey data, including composite results,
 * user-specific results, and role targets for comparison.
 */
const SurveyResults = () => {
  // Extract route parameters
  const { teamId, surveyId } = useParams<{
    teamId: string;
    surveyId: string;
  }>();
  const { traitWordings } = useAuth();

  // State for composite team results
  const [compositeResult, setCompositeResult] = useState<
    CompositeResult | undefined
  >(undefined);

  // State for handling insufficient submissions
  const [notEnoughSubmissions, setNotEnoughSubmissions] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Team and organization metadata
  const [teamName, setTeamName] = useState<string | undefined>(undefined);
  const [orgName, setOrgName] = useState<string | undefined>(undefined);
  const [organization, setOrganization] = useState<Organization | undefined>(
    undefined
  );

  // Role target data for comparison
  const [roleTarget, setRoleTarget] = useState<CompositeResult | undefined>(
    undefined
  );

  // Anonymous mode for user privacy
  const [anonymousMode, setAnonymousMode] = useState(true);

  // Individual user results
  const [userResults, setUserResults] = useState<
    UsersResultsResponse | undefined
  >(undefined);

  /**
   * Refs for capturing chart components for PDF export
   */
  const chartRefs = {
    precisionChartRef: useRef(null),
    resolveChartRef: useRef(null),
    harmonyChartRef: useRef(null),
    innovationChartRef: useRef(null),
    consonanceResonanceChartRef: useRef(null),
    traitsBarChartRef: useRef(null),
    usersTableRef: useRef(null),
    consonanceChartRef: useRef(null),
    resonanceChartRef: useRef(null),
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Try to get team information first to display in error message if needed
        try {
          const teamInfoResponse = await api.get(
            `/api/v1/team/getTeam?teamId=${teamId}`
          );
          if (teamInfoResponse.data && teamInfoResponse.data.team.name) {
            setTeamName(teamInfoResponse.data.name);
            if (
              teamInfoResponse.data.organization &&
              teamInfoResponse.data.organization.name
            ) {
              setOrgName(teamInfoResponse.data.organization.name);
              setOrganization(teamInfoResponse.data.organization);
            }
          }
        } catch (error) {
          console.log("Could not fetch team info:", error);
        }

        // Get user results - this might throw 400 if not enough submissions
        const usersResponse = await api.get(
          `/api/v1/survey/surveyResults?surveyId=${surveyId}`
        );
        setUserResults(usersResponse.data);

        // Only fetch the rest if we have user results
        const compositeResponse = await api.get(
          `/api/v1/survey/getComposite?surveyId=${surveyId}`
        );
        setCompositeResult(compositeResponse.data);

        const roleTargetResponse = await api.get(
          `/api/v1/survey/getRoleTarget?surveyId=${surveyId}`
        );
        setRoleTarget(roleTargetResponse.data);

        setNotEnoughSubmissions(false);
      } catch (error: any) {
        console.log("Error fetching survey data:", error);
        if (error.response && error.response.status === 400) {
          setNotEnoughSubmissions(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [surveyId]);

  ChartJS.register(ArcElement, Tooltip, Legend);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <ClipLoader size={50} color="#0056b3" />
        <p className="mt-4 text-gray-600">Loading survey results...</p>
      </div>
    );
  }

  /**
   * Shows not enough submissions message when there's insufficient data
   */
  if (notEnoughSubmissions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-50">
        <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-center text-gray-800">
            Not Enough Submissions
          </h2>
          {(teamName || orgName) && (
            <p className="mb-4 text-lg font-medium text-center text-gray-600">
              {orgName && teamName
                ? `${orgName} - ${teamName}`
                : teamName || orgName}
            </p>
          )}
          <p className="mb-6 text-center text-gray-600">
            There aren't enough survey submissions to generate results yet.
            Results will be available once more team members complete the
            survey.
          </p>
          <div className="p-4 rounded-md bg-blue-50">
            <p className="text-sm text-center text-blue-700">
              A minimum number of submissions is required to ensure accurate and
              meaningful analysis of team dynamics.
            </p>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 text-white transition-colors duration-300 bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Shows error message when data couldn't be loaded
   */
  if (!compositeResult || !userResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Unable to Load Results
          </h2>
          <p className="text-gray-600">
            We couldn't load all the required data for the survey results.
            Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 mt-6 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /**
   * Orders trait wordings by their rank
   *
   * @param compositeResult - The composite result containing trait ranks
   * @param traitWordings - Array of trait wording objects
   * @returns Array of ordered traits with their wordings
   */
  const getTraitWordingsByRank = (
    compositeResult: CompositeResult,
    traitWordings: any[]
  ) => {
    // Create a map of trait names to their ranks
    const traitRanks = {
      Precision: compositeResult.precisionRank,
      Resolve: compositeResult.resolveRank,
      Harmony: compositeResult.harmonyRank,
      Innovation: compositeResult.innovationRank,
    };

    // Sort traits by their rank
    const sortedTraits = Object.entries(traitRanks).sort(
      ([, rankA], [, rankB]) => rankA - rankB
    );

    // Get wordings for each trait based on their rank
    return sortedTraits.map(([traitName, rank]) => {
      const traitWording = traitWordings.find(
        (wording) =>
          wording.traitName === traitName && wording.traitWordingRank === rank
      );
      return {
        traitName,
        rank,
        wording: traitWording?.traitWording || "",
      };
    });
  };

  // Get ordered trait wordings for team's composite result
  const orderedTraitWordings = getTraitWordingsByRank(
    compositeResult,
    traitWordings
  );

  /**
   * Color mapping for consistent trait representation
   */
  const TRAIT_COLORS = {
    Precision: "#008e9e",
    Resolve: "#ed3e44",
    Harmony: "#72a854",
    Innovation: "#e8cf9b",
  };

  /**
   * Orders role target trait wordings by their rank
   *
   * @param roleTarget - The role target containing trait ranks
   * @param traitWordings - Array of trait wording objects
   * @returns Array of ordered traits with their wordings
   */
  const getRoleTargetWordingsByRank = (
    roleTarget: any,
    traitWordings: any[]
  ) => {
    // Create a map of trait names to their ranks
    const traitRanks = {
      Precision: roleTarget.precisionRank,
      Resolve: roleTarget.resolveRank,
      Harmony: roleTarget.harmonyRank,
      Innovation: roleTarget.innovationRank,
    };

    // Sort traits by their rank
    const sortedTraits = Object.entries(traitRanks).sort(
      ([, rankA], [, rankB]) => rankA - rankB
    );

    // Get wordings for each trait based on their rank
    return sortedTraits.map(([traitName, rank]) => {
      const traitWording = traitWordings.find(
        (wording) =>
          wording.traitName === traitName && wording.traitWordingRank === rank
      );
      return {
        traitName,
        rank,
        wording: traitWording?.traitWording || "",
      };
    });
  };

  // Get ordered trait wordings for role target
  const orderedRoleTargetWordings = getRoleTargetWordingsByRank(
    roleTarget,
    traitWordings
  );

  return (
    <div className="relative">
      {/* PDF Export Button */}
      <div className="absolute top-8 right-8">
        <PDFExportButton
          compositeResult={compositeResult}
          roleTarget={roleTarget}
          userResults={userResults}
          chartRefs={chartRefs}
          anonymousMode={anonymousMode}
          organization={organization!}
          traitWordings={traitWordings}
        />
      </div>

      <div className="p-8">
        {/* Team header with organization and team name */}
        <h1 className="my-4 text-3xl font-bold">
          {compositeResult.team.organization.name} - {compositeResult.team.name}
        </h1>

        {/* Commented out individual trait charts 
        <div className="grid items-center grid-cols-2 gap-8 md:grid-cols-3">
          <div className="p-4 bg-white" ref={chartRefs.precisionChartRef}>
            <h1 className="text-xl font-medium">Precision</h1>
            <span className="text-sm text-gray-300">Experts</span>
            <div className="flex items-center justify-end w-full">
              {" "}
              <CustomChart
                score={compositeResult.precisionScoreRaw}
                label="Precision"
                colorCode="#008e9e"
              />
            </div>
          </div>
          ... other charts ...
        </div> */}

        {/* Consonance chart */}
        <div
          className="w-full p-4 mt-8 bg-white"
          ref={chartRefs.consonanceChartRef}
        >
          <h1 className="mb-4 text-xl font-semibold">Consonance</h1>
          <ConsonanceBarChart compositeResult={compositeResult} />
        </div>

        {/* Resonance chart */}
        <div
          className="w-full p-4 mt-8 bg-white"
          ref={chartRefs.resonanceChartRef}
        >
          <h1 className="mb-4 text-xl font-semibold">Resonance</h1>
          <ResonanceBarChart compositeResult={compositeResult} />
        </div>

        {/* Combined consonance and resonance chart */}
        <div
          className="w-full p-4 mt-8 bg-white"
          ref={chartRefs.consonanceResonanceChartRef}
        >
          <h1>Consonance and Resonance</h1>
          <CustomBarChart compositeResult={compositeResult} />
        </div>

        {/* Combined trait comparison chart */}
        <div ref={chartRefs.traitsBarChartRef}>
          <CombinedTraitBarChart
            compositeResult={compositeResult}
            roleTarget={roleTarget!}
          />
        </div>

        {/* Trait wordings explanation section */}
        <div className="p-6 mt-8 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Understanding Your Team's Factors Alignment
          </h2>
          <p className="mb-6 text-gray-600">
            The gap between your team's average BCAT Inspiration score and your
            Consensus Role Target guides the members of your team in developing
            Personal Alignment Plans – commitments to observable change at work
            in order to better align themselves with your team's mission and
            goals.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Team values section */}
            <div>
              <h3 className="mb-3 text-lg font-medium text-gray-800">
                Team Values
              </h3>
              <div className="p-4 rounded-lg bg-gray-50">
                {orderedTraitWordings.map((trait, _) => (
                  <p
                    key={trait.traitName}
                    className="mb-4 text-base"
                    style={{
                      color:
                        TRAIT_COLORS[
                          trait.traitName as keyof typeof TRAIT_COLORS
                        ],
                    }}
                  >
                    {trait.wording}
                  </p>
                ))}
              </div>
            </div>

            {/* Role target values section */}
            {roleTarget && roleTarget.precisionRank && (
              <div>
                <h3 className="mb-3 text-lg font-medium text-gray-800">
                  Organization Target Values
                </h3>
                <div className="p-4 rounded-lg bg-gray-50">
                  {orderedRoleTargetWordings.map((trait, _) => (
                    <p
                      key={trait.traitName}
                      className="mb-4 text-base"
                      style={{
                        color:
                          TRAIT_COLORS[
                            trait.traitName as keyof typeof TRAIT_COLORS
                          ],
                      }}
                    >
                      {trait.wording}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Individual user results table */}
        <div ref={chartRefs.usersTableRef}>
          <UsersSkillsRankingTable
            userResults={userResults}
            anonymousMode={anonymousMode}
            setAnonymousMode={setAnonymousMode}
          />
        </div>
      </div>
    </div>
  );
};

export default SurveyResults;
