/**
 * CurrentMembers.tsx
 *
 * This component displays a list of current team members with the ability to remove
 * them from the team. It's designed to be used in various team management contexts,
 * such as team creation, editing, and member administration.
 *
 * Key features:
 * - Displays a list of current team members with their names and emails
 * - Provides a remove button for each member
 * - Clean, consistent styling that matches the application design
 * - Simple, reusable interface for member management
 */

import { FC } from "react";
import { Member } from "../Organization/CreateOrganization";

/**
 * Props interface for the CurrentMembers component
 */
interface CurrentMembersProps {
  currentMembers: Member[]; // Array of members to display
  handleDeleteMember: (index: number) => void; // Callback function to remove a member by index
}

/**
 * CurrentMembers component displays a list of team members with remove functionality
 *
 * @param currentMembers - Array of Member objects to display
 * @param handleDeleteMember - Callback function that handles member deletion by index
 */
const CurrentMembers: FC<CurrentMembersProps> = ({
  currentMembers,
  handleDeleteMember,
}) => {
  return (
    <div className="w-full p-4 mt-4 bg-transparent rounded-lg">
      <h3 className="mb-2 text-sm font-medium text-gray-700">
        Current Members
      </h3>

      {/* Member list */}
      <ul className="space-y-2 bg-transparent">
        {currentMembers.map((member, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-2 bg-transparent rounded-md shadow-sm"
          >
            {/* Member information */}
            <div className="flex items-center gap-3 ">
              <span className="text-sm text-gray-700">{member.username}</span>
              <span className="text-sm text-gray-500">({member.email})</span>
            </div>

            {/* Remove button */}
            <button
              type="button"
              className="text-sm text-red-500 hover:text-red-700"
              onClick={() => handleDeleteMember(index)}
              aria-label={`Remove ${member.username}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrentMembers;
