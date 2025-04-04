/**
 * DesiredSkills.tsx
 *
 * This component renders the second step of the survey process, where users
 * rate the importance of various skills for their role or team. It displays
 * a table of skills with radio button options for importance levels.
 *
 * Key features:
 * - Displays a list of skills from the Survey context
 * - Allows users to rate each skill as "Very Important", "Somewhat Important", or "Not Important"
 * - Tracks selected ratings and updates the Survey context
 * - Provides navigation to return to the previous screen or submit the survey
 * - Shows loading indicators during data fetching and submission
 */

// import { useEffect } from "react";
import { PulseLoader } from "react-spinners";
import { useSurvey } from "../../contexts/Survey";

/**
 * DesiredSkills component for rating the importance of various skills
 *
 * @param handlePrev - Function to navigate back to the previous screen
 */
const DesiredSkills = ({ handlePrev }: { handlePrev: () => void }) => {
  const {
    skills, // List of skills to display
    setSelectedSkills, // Function to update selected skills
    selectedSkills, // Currently selected skills
    loading, // Loading state for skills data
    handleSubmitSurvey, // Function to submit the survey
    submitLoading, // Loading state during survey submission
  } = useSurvey();

  // Commented code below would have randomly pre-selected responses for testing
  // const possibleResponses = ["veryImportant", "someWhat", "notImportant"];

  // Function to randomly pre-check inputs
  // const preselectRandomResponses = () => {
  //   const randomSelections = skills.map((skill) => ({
  //     desiredSkillId: skill.skillId,
  //     response:
  //       possibleResponses[Math.floor(Math.random() * possibleResponses.length)],
  //   }));

  //   setSelectedSkills(randomSelections);
  // };

  // Run this function once when the component mounts
  // useEffect(() => {
  //   preselectRandomResponses();
  // }, []);

  /**
   * Updates the selected rating for a skill when a radio button is clicked
   *
   * @param desiredSkillId - The ID of the skill being rated
   * @param response - The selected importance level
   */
  const handleRadioChange = (desiredSkillId: number, response: string) => {
    setSelectedSkills((prev) => {
      const existingSkillIndex = prev.findIndex(
        (skill) => skill.desiredSkillId === desiredSkillId
      );
      if (existingSkillIndex !== -1) {
        // Update existing selection
        const updatedSkills = [...prev];
        updatedSkills[existingSkillIndex].response = response;
        return updatedSkills;
      } else {
        // Add new selection
        return [...prev, { desiredSkillId, response }];
      }
    });
  };

  /**
   * Utility function to capitalize the first letter of a string
   * Used for displaying skill names properly
   *
   * @param str - The string to capitalize
   * @returns The capitalized string
   */
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const allAnswered = skills.every((skill) =>
    selectedSkills.some((ss) => ss.desiredSkillId === skill.skillId)
  );
  return (
    <div>
      <div className="flex items-center justify-center min-h-screen">
        <form className="w-full max-w-2xl p-0 rounded-lg md:p-6">
          {/* Show loading spinner while fetching skills */}
          {loading && (
            <div className="flex items-center justify-center h-screen">
              <PulseLoader color="#0091AB" />
            </div>
          )}
          {!allAnswered && !loading && (
            <div className="mt-2 text-red-500">
              Please answer all questions before submitting.
            </div>
          )}

          {/* Skills rating table */}
          {!loading && (
            <div className="overflow-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Skill</th>
                    <th className="p-2 text-center">Very Important</th>
                    <th className="p-2 text-center">Somewhat Important</th>
                    <th className="p-2 text-center">Not Important</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((skill) => {
                    // Find if this skill has been rated already
                    const selectedSkill = selectedSkills.find(
                      (ss) => ss.desiredSkillId === skill.skillId
                    );
                    return (
                      <tr key={skill.skillId} className="border-t">
                        {/* Skill name */}
                        <td className="p-2">
                          {capitalizeFirstLetter(skill.skillName)}
                        </td>

                        {/* "Very Important" option */}
                        <td className="p-2 text-center">
                          <input
                            type="radio"
                            name={`skill-${skill.skillId}`}
                            value="veryImportant"
                            className="scale-125"
                            checked={
                              selectedSkill?.response === "veryImportant"
                            }
                            onChange={() =>
                              handleRadioChange(skill.skillId, "veryImportant")
                            }
                          />
                        </td>

                        {/* "Somewhat Important" option */}
                        <td className="p-2 text-center">
                          <input
                            type="radio"
                            className="scale-125"
                            name={`skill-${skill.skillId}`}
                            value="someWhat"
                            checked={selectedSkill?.response === "someWhat"}
                            onChange={() =>
                              handleRadioChange(skill.skillId, "someWhat")
                            }
                          />
                        </td>

                        {/* "Not Important" option */}
                        <td className="p-2 text-center">
                          <input
                            type="radio"
                            className="scale-125"
                            name={`skill-${skill.skillId}`}
                            value="notImportant"
                            checked={selectedSkill?.response === "notImportant"}
                            onChange={() =>
                              handleRadioChange(skill.skillId, "notImportant")
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {/* Back button */}
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center justify-between px-4 py-1 font-normal text-white rounded-full bg-Turquoise disabled:opacity-50"
            >
              ← Back
            </button>

            {/* Submit button with loading state */}
            <button
              type="button"
              onClick={handleSubmitSurvey}
              disabled={!allAnswered || submitLoading}
              className="flex items-center justify-between px-4 py-1 font-normal text-white rounded-full bg-Turquoise disabled:opacity-50"
            >
              {
                // Show a loading spinner if the submit button is clicked
                submitLoading ? (
                  <PulseLoader color="#ffffff" size={8} />
                ) : (
                  "Submit"
                )
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DesiredSkills;
