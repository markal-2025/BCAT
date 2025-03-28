/**
 * UsersSkillsRankingTable.tsx
 *
 * This component displays individual survey results for team members in a tabular format,
 * showing their rankings and scores across four key traits: Precision, Resolve, Harmony,
 * and Innovation. It supports an anonymous mode to protect participant privacy when needed.
 *
 * Key features:
 * - Displays trait rankings and adjusted scores for each user
 * - Shows the primary trait (rank 1) with color coding
 * - Supports toggling between identified and anonymous modes
 * - Responsive table with scrollable content for larger datasets
 * - Visual distinction between different traits using color coding
 */

import { UsersResultsResponse } from "./SurveyResults";
import { Switch } from "@mui/material";
import { Label } from "@mui/icons-material";

/**
 * UsersSkillsRankingTable component for displaying individual survey results
 *
 * @param userResults - Array of user survey results with trait rankings and scores
 * @param anonymousMode - Boolean indicating whether names should be anonymized
 * @param setAnonymousMode - Function to toggle the anonymous mode state
 */
const UsersSkillsRankingTable = ({
  userResults,
  anonymousMode,
  setAnonymousMode,
}: {
  userResults: UsersResultsResponse;
  anonymousMode: boolean;
  setAnonymousMode: (value: boolean) => void;
}) => {
  /**
   * Generates an anonymous identifier for a team member
   *
   * @param index - The index of the team member in the results array
   * @returns A generic identifier string like "Team Member 1"
   */
  const getAnonymousName = (index: number) => {
    return `Team Member ${index + 1}`;
  };

  /**
   * Toggles the anonymous mode on and off
   * Updates the parent component's state through the provided setter
   */
  const toggleAnonymousMode = () => {
    setAnonymousMode(!anonymousMode);
  };

  return (
    <div className="w-full p-4 mt-8 bg-white">
      {/* Header section with title and anonymous mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Individual Results</h2>

        <div className="flex items-center space-x-2">
          <Switch
            id="anonymous-mode"
            checked={anonymousMode}
            onChange={toggleAnonymousMode}
            aria-label="Toggle anonymous mode"
          />
          <Label className="text-sm font-medium text-gray-700">
            {anonymousMode ? "Anonymous Mode" : "Show Names"}
          </Label>
        </div>
      </div>

      {/* Results table with scrollable container */}
      <div className="overflow-y-auto border border-gray-200 rounded max-h-96">
        <table className="w-full text-sm text-left">
          {/* Table header with trait columns */}
          <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">
                {anonymousMode ? "Team Member" : "User"}
              </th>
              <th className="px-4 py-3">
                <span className="text-cyan-600">Precision</span>
                <span className="block text-xs font-normal text-gray-500">
                  Rank
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="text-red-500">Resolve</span>
                <span className="block text-xs font-normal text-gray-500">
                  Rank
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="text-green-600">Harmony</span>
                <span className="block text-xs font-normal text-gray-500">
                  Rank
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="text-amber-400">Innovation</span>
                <span className="block text-xs font-normal text-gray-500">
                  Rank
                </span>
              </th>
              <th className="px-4 py-3">Primary Trait</th>
            </tr>
          </thead>

          {/* Table body with user results */}
          <tbody>
            {userResults.map((user, index) => {
              // Define traits with their ranks and display styles
              const traits = [
                {
                  name: "Precision",
                  rank: user.precisionRank,
                  color: "bg-cyan-100 text-cyan-800",
                },
                {
                  name: "Resolve",
                  rank: user.resolveRank,
                  color: "bg-red-100 text-red-800",
                },
                {
                  name: "Harmony",
                  rank: user.harmonyRank,
                  color: "bg-green-100 text-green-800",
                },
                {
                  name: "Innovation",
                  rank: user.innovationRank,
                  color: "bg-amber-100 text-amber-800",
                },
              ];

              // Determine the primary trait (trait with rank 1)
              const primaryTrait =
                traits.find((trait) => trait.rank === 1) || traits[0];

              return (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  {/* User name or anonymous identifier */}
                  <td className="px-4 py-3 font-medium">
                    {anonymousMode
                      ? getAnonymousName(index)
                      : user.user.username}
                  </td>

                  {/* Trait rankings and scores */}
                  <td className="px-4 py-3">
                    {user.precisionRank} | {user.precisionAdjScore}%
                  </td>
                  <td className="px-4 py-3">
                    {user.resolveRank} | {user.resolveAdjScore}%
                  </td>
                  <td className="px-4 py-3">
                    {user.harmonyRank} | {user.harmonyAdjScore}%
                  </td>
                  <td className="px-4 py-3">
                    {user.innovationRank} | {user.innovationAdjScore}%
                  </td>

                  {/* Primary trait with color-coded badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${primaryTrait.color}`}
                    >
                      {primaryTrait.name}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersSkillsRankingTable;
