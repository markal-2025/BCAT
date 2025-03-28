/**
 * RoleTarget.tsx
 *
 * This component implements a dialog for administrators to define role targets
 * for their team by assigning ranks and percentage distributions to four key traits:
 * precision, resolve, harmony, and innovation.
 *
 * Key features:
 * - Interactive ranking system to prioritize traits from 1-4
 * - Percentage distribution selection with predefined patterns
 * - Dynamic updating of percentage allocations based on rankings
 * - Validation to ensure complete ranking before percentage assignment
 * - Visual feedback showing applied percentages
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, styled } from "@mui/material";
import { ClipLoader } from "react-spinners";

/**
 * Styled dialog component with custom styling for consistent UI appearance
 */
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: 10,
    minWidth: "500px",
  },
}));

/**
 * Props interface for the RoleTargetDialog component
 */
interface RoleTargetDialogProps {
  open: boolean; // Controls dialog visibility
  onClose: () => void; // Function to close the dialog
  onSubmit: (
    // Function to submit the selected values
    selectedRanks: RankSelection,
    selectedPercentages: PercentageDistribution
  ) => Promise<void>; // Ensure onSubmit is async
}

/**
 * Interface for tracking trait rankings (1-4)
 */
interface RankSelection {
  precision: string;
  resolve: string;
  harmony: string;
  innovation: string;
}

/**
 * Interface for tracking percentage distribution across traits
 */
interface PercentageDistribution {
  precision: number;
  resolve: number;
  harmony: number;
  innovation: number;
}

/**
 * Predefined percentage distribution patterns to choose from
 * Each array represents [1st rank, 2nd rank, 3rd rank, 4th rank] percentages
 */
const percentageOptions = [
  [50, 25, 15, 10], // Option 1: Strong emphasis on top trait
  [40, 30, 20, 10], // Option 2: Balanced between top two traits
  [35, 30, 25, 10], // Option 3: More distributed across top three traits
];

/**
 * Dialog component for setting team role targets through trait ranking and percentage allocation
 *
 * Guides users through a two-step process:
 * 1. Rank the four traits from 1-4
 * 2. Select a percentage distribution pattern for those traits
 *
 * @param open - Whether the dialog is visible
 * @param onClose - Function to call when dialog should close
 * @param onSubmit - Function to call with final selections when submitting
 */
const RoleTargetDialog: React.FC<RoleTargetDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const rankOptions: string[] = ["1", "2", "3", "4"]; // Available ranking options

  /**
   * State for tracking the selected rank for each trait
   */
  const [selectedRanks, setSelectedRanks] = useState<RankSelection>({
    precision: "",
    resolve: "",
    harmony: "",
    innovation: "",
  });

  /**
   * State for tracking the calculated percentage for each trait
   */
  const [selectedPercentages, setSelectedPercentages] =
    useState<PercentageDistribution>({
      precision: 0,
      resolve: 0,
      harmony: 0,
      innovation: 0,
    });

  const [selectedOption, setSelectedOption] = useState<number | null>(null); // Selected percentage option
  const [loading, setLoading] = useState<boolean>(false); // Loading state for submission

  /**
   * Gets available rank options for a specific trait
   * Filters out ranks already assigned to other traits
   *
   * @param currentField - The trait field being ranked
   * @returns Array of available rank options
   */
  const getAvailableRanks = (currentField: keyof RankSelection): string[] => {
    return rankOptions.filter(
      (rank) =>
        !Object.values(selectedRanks).includes(rank) ||
        selectedRanks[currentField] === rank
    );
  };

  /**
   * Handles changes to trait rankings
   * Updates the rank for the specified trait and resets percentage selections
   *
   * @param field - The trait being ranked
   * @param value - The selected rank value
   */
  const handleRankChange = (field: keyof RankSelection, value: string) => {
    setSelectedRanks((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Reset percentage selection when ranks change
    setSelectedOption(null);
    setSelectedPercentages({
      precision: 0,
      resolve: 0,
      harmony: 0,
      innovation: 0,
    });
  };

  /**
   * Handles selection of a percentage distribution pattern
   * Calculates and assigns percentages to traits based on their ranks
   *
   * @param optionIndex - Index of the selected percentage distribution pattern
   */
  const handlePercentageSelection = (optionIndex: number) => {
    setSelectedOption(optionIndex);

    // Sort trait fields by their assigned value (lowest rank = highest percentage)
    const sortedTraits = (
      Object.keys(selectedRanks) as Array<keyof RankSelection>
    ).sort((a, b) => Number(selectedRanks[a]) - Number(selectedRanks[b]));

    // Get corresponding percentage values based on selected option
    const percentages = percentageOptions[optionIndex];

    // Explicitly define newPercentages as a PercentageDistribution object
    const newPercentages: PercentageDistribution = {
      precision: 0,
      resolve: 0,
      harmony: 0,
      innovation: 0,
    };

    // Assign the correct percentage to each trait based on sorted rank
    sortedTraits.forEach((trait, index) => {
      newPercentages[trait] = percentages[index];
    });

    setSelectedPercentages(newPercentages);
  };

  // Check if all traits have been ranked before allowing percentage selection
  const isRankingComplete = Object.values(selectedRanks).every(
    (rank) => rank !== ""
  );
  const isPercentageComplete = selectedOption !== null;

  /**
   * Handles submission of the role target settings
   * Calls the provided onSubmit function with selected values
   */
  const handleSubmit = async () => {
    setLoading(true); // Start loading
    try {
      await onSubmit(selectedRanks, selectedPercentages); // Call onSubmit function
      onClose(); // Close dialog after successful submission
    } catch (error) {
      console.error("Error submitting role target:", error);
    }
    setLoading(false); // Stop loading
  };

  return (
    <BootstrapDialog
      open={open}
      onClose={onClose}
      className="responsive-dialog"
    >
      <DialogTitle className="!pb-0 !font-medium !text-2xl text-center">
        Define Role Target For Your Team
      </DialogTitle>
      <DialogContent className="mt-6 space-y-6">
        {/* Trait Ranking Inputs */}
        {(
          ["precision", "resolve", "harmony", "innovation"] as Array<
            keyof RankSelection
          >
        ).map((field) => (
          <div key={field} className="flex flex-col gap-2">
            <label className="text-lg font-medium capitalize">
              {field} Rank:
            </label>
            <select
              className="w-full p-2 bg-white border rounded-lg outline-none"
              value={selectedRanks[field]}
              onChange={(e) => handleRankChange(field, e.target.value)}
            >
              <option value="">Select Rank</option>
              {getAvailableRanks(field).map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Percentage Distribution Selection */}
        <div className="mt-6">
          <label className="text-lg font-medium">
            Select Percentage Distribution:
          </label>
          <div className="flex flex-col gap-2 mt-2">
            {percentageOptions.map((option, index) => (
              <button
                key={index}
                className={`p-2 border rounded-lg text-left transition ${
                  selectedOption === index
                    ? "bg-Turquoise text-white border-Turquoise"
                    : "bg-white border-gray-300"
                }`}
                onClick={() => handlePercentageSelection(index)}
                disabled={!isRankingComplete}
              >
                {option.join(" - ")} %
              </button>
            ))}
          </div>
        </div>

        {/* Display of Applied Percentages */}
        {isPercentageComplete && (
          <div className="mt-6">
            <h3 className="text-lg font-medium">Applied Percentages:</h3>
            <ul className="mt-2 space-y-2">
              {Object.entries(selectedPercentages).map(
                ([trait, percentage]) => (
                  <li
                    key={trait}
                    className="flex justify-between pb-1 border-b"
                  >
                    <span className="capitalize">{trait}</span>
                    <span>{percentage}%</span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </DialogContent>

      {/* Action Buttons */}
      <div className="flex flex-col items-center justify-center gap-4 p-4 md:justify-end md:flex-row">
        <button
          onClick={onClose}
          type="button"
          className="btn-primary !bg-white !px-8 !text-Turquoise md:!w-fit !w-full border border-Turquoise"
          disabled={loading}
        >
          Back
        </button>
        <button
          className="btn-primary !px-12 md:!w-fit !w-full border border-Turquoise"
          onClick={handleSubmit}
          disabled={!isPercentageComplete || loading} // Disable until percentage is selected
        >
          {loading ? <ClipLoader color="#fff" size={20} /> : "Submit"}
        </button>
      </div>
    </BootstrapDialog>
  );
};

export default RoleTargetDialog;
