/**
 * SavedTeams.tsx
 *
 * This component renders a collapsible team item that can be expanded to view
 * and edit team details. It provides an interface for administrators to manage
 * existing teams, including editing team information, managing team members,
 * and performing team-level operations like saving changes or deleting the team.
 *
 * Key features:
 * - Collapsible team display with toggle functionality
 * - Form fields for editing team name, community, description, and mission
 * - Interface for adding new team members with email and username
 * - Display of current team members with deletion capability
 * - Save changes and delete team actions
 */

import {
  Collapse,
  ListItemButton,
  ListItemText,
  TextareaAutosize,
} from "@mui/material";
import DropDown from "../../../icons/DropDown";
import { Team } from "../Organization/CreateOrganization";
import { useState } from "react";
import Email from "../../../icons/Email";
import Profile from "../../../icons/Profile";
import CurrentMembers from "./CurrentMembers";

/**
 * Props for the SavedTeams component
 */
interface SavedTeamsProps {
  team: Team; // The team data to display and edit
  isOpen: boolean; // Whether the team details section is expanded
  handleToggle: (teamName: string) => void; // Function to toggle team expansion
  onUpdateTeam: (updatedTeam: Team) => void; // Callback to save updated team data
  onDeleteTeam: () => void; // Callback to delete the team
}

/**
 * SavedTeams component that displays a collapsible team item with edit capabilities
 *
 * @param team - The team data to display and edit
 * @param isOpen - Whether the team details are currently expanded
 * @param handleToggle - Function to toggle the expanded state
 * @param onUpdateTeam - Callback function to save team changes
 * @param onDeleteTeam - Callback function to delete the team
 */
const SavedTeams: React.FC<SavedTeamsProps> = ({
  team,
  isOpen,
  handleToggle,
  onUpdateTeam,
  onDeleteTeam,
}) => {
  const [editedTeam, setEditedTeam] = useState<Team>({ ...team }); // Local state for team edits
  const [newMemberEmail, setNewMemberEmail] = useState(""); // State for new member email input
  const [newMemberUsername, setNewMemberUsername] = useState(""); // State for new member username input

  /**
   * Updates a specific field in the edited team state
   *
   * @param field - The team property to update
   * @param value - The new value for the property
   */
  const handleChange = (field: keyof Team, value: string) => {
    setEditedTeam((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Saves the current edited team data by calling the parent callback
   */
  const handleSave = () => {
    onUpdateTeam(editedTeam); // Pass the updated team back to the parent
  };

  /**
   * Removes a team member at the specified index
   *
   * @param index - The index of the member to remove
   */
  const handleDeleteMember = (index: number) => {
    setEditedTeam((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  /**
   * Adds a new team member if both email and username are provided
   * Validates that the email doesn't already exist in the team
   */
  const handleAddUser = () => {
    if (newMemberEmail.trim() && newMemberUsername.trim()) {
      // Check if the email is already in the list
      if (
        editedTeam.members.some((member) => member.email === newMemberEmail)
      ) {
        alert("User with this email already exists.");
        return;
      }

      // Add the new member to the team
      setEditedTeam((prev) => ({
        ...prev,
        members: [
          ...prev.members,
          { email: newMemberEmail, username: newMemberUsername },
        ],
      }));

      // Reset input fields
      setNewMemberEmail("");
      setNewMemberUsername("");
    } else {
      alert("Please fill in both email and username.");
    }
  };

  return (
    <div>
      {/* Collapsible team header */}
      <ListItemButton
        onClick={() => handleToggle(team.name)}
        className="rounded-md hover:bg-gray-100"
      >
        <ListItemText primary={team.name} />
        {<DropDown />}
      </ListItemButton>

      {/* Collapsible team details */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit className="ml-4">
        <div className="flex flex-col w-full pb-4">
          {/* Team name and community section */}
          <div className="flex items-center w-full gap-4 mt-4">
            <div className="flex flex-col w-1/2">
              <label htmlFor="" className="text-sm">
                Team name
              </label>
              <input
                type="text"
                value={editedTeam.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
              />
            </div>
            <div className="flex flex-col w-1/2">
              <label htmlFor="" className="text-sm">
                Community the team serves
              </label>
              <input
                type="text"
                value={editedTeam.community}
                onChange={(e) => handleChange("community", e.target.value)}
                className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
              />
            </div>
          </div>

          {/* Team description section */}
          <div className="w-full mt-4">
            <label htmlFor="">Team description</label>
            <TextareaAutosize
              minRows={4}
              value={editedTeam.teamDescription}
              onChange={(e) => handleChange("teamDescription", e.target.value)}
              className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
            />
          </div>

          {/* Team mission section */}
          <div className="w-full mt-4">
            <label htmlFor="">Team mission</label>
            <TextareaAutosize
              minRows={4}
              value={editedTeam.mission}
              onChange={(e) => handleChange("mission", e.target.value)}
              className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
            />
          </div>

          {/* Team members section */}
          <div className="w-full mt-4">
            <label htmlFor="">Members</label>
            <div className="flex w-full gap-5">
              {/* Email input for new member */}
              <div className="relative w-full">
                <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                  <Email />
                </div>
                <input
                  name="email"
                  placeholder="Email"
                  type="text"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="px-3 py-1.5 pl-10 w-full border rounded-lg outline-none mt-1 border-gray-300"
                />
              </div>

              {/* Username input for new member */}
              <div className="relative w-full">
                <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                  <Profile />
                </div>
                <input
                  name="username"
                  placeholder="User name"
                  type="text"
                  value={newMemberUsername}
                  onChange={(e) => setNewMemberUsername(e.target.value)}
                  className="px-3 py-1.5 pl-10 w-full border rounded-lg outline-none mt-1 border-gray-300"
                />
              </div>

              {/* Add user button */}
              <button
                type="button"
                onClick={handleAddUser}
                className="flex items-center justify-center !w-fit font-normal text-white rounded-full btn-primary bg-Turquoise"
              >
                +
              </button>
            </div>

            {/* Display current team members if any exist */}
            {editedTeam.members.length > 0 && (
              <CurrentMembers
                currentMembers={editedTeam.members}
                handleDeleteMember={handleDeleteMember}
              />
            )}
          </div>

          {/* Action buttons section */}
          <div className="flex flex-col gap-2 mt-4">
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary !w-full"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onDeleteTeam}
              className="btn-primary !w-full !bg-red-500 text-white"
            >
              Delete Team
            </button>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default SavedTeams;
