/**
 * Behaviour.tsx
 *
 * This component implements the second step of the survey, where users rate
 * behavioral traits as favorable, unfavorable, or no opinion. It displays traits
 * in paginated tables and enforces completion of all items before proceeding.
 *
 * Key features:
 * - Displays traits in manageable pages (20 traits per page)
 * - Tracks user responses for each trait
 * - Validates completion of all questions before proceeding
 * - Shows a popup with instructions on first display
 * - Provides navigation between pages and survey steps
 */

import { useState } from "react";
import { PulseLoader } from "react-spinners";
import { useSurvey } from "../../contexts/Survey";

/**
 * Behaviour component displays a paginated list of traits for user rating
 *
 * @param handlePrev - Function to navigate to previous survey step
 * @param handleNext - Function to navigate to next survey step
 * @param popup - Boolean controlling the visibility of the instructions popup
 * @param setPopup - State setter for popup visibility
 */
const Behaviour = ({
  handlePrev,
  handleNext,
  popup,
  setPopup,
}: {
  handlePrev: () => void;
  handleNext: () => void;
  popup: boolean;
  setPopup: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [currentPage, setCurrentPage] = useState(0); // Current page of traits
  const traitsPerPage = 20; // Number of traits per page
  const { traits, selectedTraits, setSelectedTraits, loading } = useSurvey();

  // Commented code for random selection (testing purposes)
  // const possibleResponses = ["favorable", "no opinion", "unfavorable"];

  // Function to randomly pre-check inputs
  // const preselectRandomResponses = () => {
  //   const randomSelections = traits.map((trait) => ({
  //     traitId: trait.traitId,
  //     response:
  //       possibleResponses[Math.floor(Math.random() * possibleResponses.length)],
  //   }));

  //   setSelectedTraits(randomSelections);
  // };

  // Run this function once when the component mounts
  // useEffect(() => {
  //   preselectRandomResponses();
  // }, []);

  /**
   * Checks if all traits on the current page have been answered
   */
  const areAllTraitsAnswered = () => {
    const currentPageTraits = traits.slice(
      currentPage * traitsPerPage,
      (currentPage + 1) * traitsPerPage
    );

    return currentPageTraits.every((trait) =>
      selectedTraits.some((st) => st.traitId === trait.traitId && st.response)
    );
  };

  /**
   * Handles navigation to the next page of traits or to the next survey step
   */
  const handleNextPage = () => {
    if ((currentPage + 1) * traitsPerPage >= traits.length) {
      handleNext();
    } else {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  /**
   * Handles navigation to the previous page of traits or to the previous survey step
   */
  const handleBack = () => {
    if (currentPage === 0) {
      handlePrev();
    } else {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  /**
   * Updates the selected rating for a trait when a radio button is clicked
   *
   * @param traitId - The ID of the trait being rated
   * @param response - The selected rating (favorable, no opinion, unfavorable)
   */
  const handleRadioChange = (traitId: number, response: string) => {
    setSelectedTraits((prev) => {
      const existingTraitIndex = prev.findIndex(
        (trait) => trait.traitId === traitId
      );

      if (existingTraitIndex !== -1) {
        // Update existing selection
        const updatedTraits = [...prev];
        updatedTraits[existingTraitIndex].response = response;
        return updatedTraits;
      } else {
        // Add new selection
        return [...prev, { traitId, response }];
      }
    });
  };

  // Get the current page of traits to display
  const paginatedTraits = traits.slice(
    currentPage * traitsPerPage,
    (currentPage + 1) * traitsPerPage
  );

  /**
   * Utility function to capitalize the first letter of trait names
   */
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen">
        <form className="w-full max-w-2xl p-0 rounded-lg md:p-6">
          {/* Show loading spinner while fetching traits */}
          {loading && (
            <div className="flex items-center justify-center h-screen">
              <PulseLoader color="#0091AB" />
            </div>
          )}

          {/* Traits rating table */}
          {/* Traits rating section with sticky headers and visible scrollbar */}
          {!loading && (
            <div className="flex flex-col h-[calc(100vh-120px)]">
              {/* Sticky header */}
              <div className="sticky top-0 z-10 grid grid-cols-4 bg-white border-b shadow-sm">
                <div className="p-2 font-bold text-left">Trait</div>
                <div className="p-2 font-bold text-center">Favorable</div>
                <div className="p-2 font-bold text-center">No Opinion</div>
                <div className="p-2 font-bold text-center">Unfavorable</div>
              </div>

              {/* Scrollable traits container with visible scrollbar */}
              <div
                className="flex-grow overflow-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#0091AB #f1f1f1",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {/* Custom scrollbar styles for WebKit browsers */}
                <style>{`
                  div::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                    display: block;
                  }
                  div::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: #0091ab;
                    border-radius: 4px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: #007a8f;
                  }
                `}</style>

                {paginatedTraits.map((trait) => {
                  // Find if this trait has been rated already
                  const selectedTrait = selectedTraits.find(
                    (st) => st.traitId === trait.traitId
                  );
                  return (
                    <div
                      key={trait.traitId}
                      className="grid grid-cols-4 border-b"
                    >
                      {/* Trait name */}
                      <div className="p-2">
                        {capitalizeFirstLetter(trait.traitName)}
                      </div>

                      {/* "Favorable" option */}
                      <div className="p-2 text-center">
                        <label className="block w-full py-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`trait-${trait.traitId}`}
                            value="favorable"
                            className="scale-125"
                            checked={selectedTrait?.response === "favorable"}
                            onChange={() =>
                              handleRadioChange(trait.traitId, "favorable")
                            }
                          />
                        </label>
                      </div>

                      {/* "No Opinion" option */}
                      <div className="p-2 text-center">
                        <label className="block w-full py-2 cursor-pointer">
                          <input
                            type="radio"
                            className="scale-125"
                            name={`trait-${trait.traitId}`}
                            value="no opinion"
                            checked={selectedTrait?.response === "no opinion"}
                            onChange={() =>
                              handleRadioChange(trait.traitId, "no opinion")
                            }
                          />
                        </label>
                      </div>

                      {/* "Unfavorable" option */}
                      <div className="p-2 text-center">
                        <label className="block w-full py-2 cursor-pointer">
                          <input
                            type="radio"
                            className="scale-125"
                            name={`trait-${trait.traitId}`}
                            value="unfavorable"
                            checked={selectedTrait?.response === "unfavorable"}
                            onChange={() =>
                              handleRadioChange(trait.traitId, "unfavorable")
                            }
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-between px-4 py-1 font-normal text-white rounded-full bg-Turquoise disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={!areAllTraitsAnswered()}
              className="flex items-center justify-between px-4 py-1 font-normal text-white rounded-full bg-Turquoise disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </form>
      </div>

      {/* Instructions popup shown on initial display */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg max-w-[300px] md:max-w-[500px]">
            <h1 className="mb-12 text-2xl">Team Behavior Trait Assessment</h1>
            <p>Please read and respond to All of the words in these 8 lists.</p>
            <p>
              Identify the words that you consider to be FAVORABLE or
              UNFAVORABLE behavioral traits for your Team to successfully
              complete its mission. If you feel a trait doesn't matter, select
              NO OPINION. Please try to designate at least 5 words in each list
              as either FAVORABLE or UNFAVORABLE.
            </p>
            <div className="flex flex-col-reverse items-center justify-end w-full gap-4 mt-4 md:flex-row">
              <button
                onClick={handlePrev}
                className="px-6 py-1 border rounded-full border-Turquoise"
              >
                Back
              </button>
              <button
                onClick={() => setPopup(false)}
                className="px-8 py-1 text-white rounded-full bg-Turquoise"
              >
                Begin Survey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Behaviour;
