/**
 * CreateTeamForm.tsx
 *
 * This component provides a form interface for creating new teams within the organization.
 * It allows administrators to input team details and add team members both individually
 * and through bulk Excel uploads.
 *
 * Key features:
 * - Input fields for team name, community, description, and mission
 * - Character counting for text areas with maximum limits
 * - Individual member addition with email and name fields
 * - Bulk member upload via Excel file (.xlsx, .xls)
 * - Display and management of current team members
 * - Form validation and submission handling
 */

import React, { RefObject, useState } from "react";
import { TextareaAutosize } from "@mui/material";
import * as XLSX from "xlsx";
import { toast, Bounce } from "react-toastify";
import Email from "../../../icons/Email";
import Profile from "../../../icons/Profile";
import { Member } from "../Organization/CreateOrganization";
import CurrentMembers from "./CurrentMembers";

/**
 * Props interface for the CreateTeamForm component
 */
interface CreateTeamFormProps {
  createTeamForm: RefObject<HTMLFormElement>; // Reference to the form element
  handleAddUser: () => void; // Function to add a single user
  handleFormSubmit: () => void; // Function for final form submission
  currentMembers: Member[]; // Array of current team members
  handleDeleteMember: (index: number) => void; // Function to remove a member
  setCurrentMembers: (members: Member[]) => void; // Function to update the members list
}

/**
 * Form component for creating a new team with details and members
 *
 * @param createTeamForm - Reference to the form element
 * @param handleAddUser - Function to handle adding a single user
 * @param handleFormSubmit - Function to handle final form submission
 * @param currentMembers - Current list of team members
 * @param handleDeleteMember - Function to handle member removal
 * @param setCurrentMembers - Function to update the members list
 */
const CreateTeamForm: React.FC<CreateTeamFormProps> = ({
  createTeamForm,
  handleAddUser,
  handleFormSubmit,
  currentMembers,
  handleDeleteMember,
  setCurrentMembers,
}) => {
  // State for character counting in text areas
  const [descriptionCount, setDescriptionCount] = useState(0);
  const [missionCount, setMissionCount] = useState(0);

  // Character limits for description and mission fields
  const maxDescriptionLength = 400;
  const maxMissionLength = 200;

  // Note: Minimum length validation is commented out in the original code
  // const minDescriptionLength = 400;
  // const minMissionLength = 200;
  // const isCreateDisabled =
  //   descriptionCount < minDescriptionLength || missionCount < minMissionLength;

  /**
   * Handles Excel file upload for bulk member addition
   * Parses the Excel file and adds valid members to the current members list
   *
   * @param event - File input change event
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      const newMembers: Member[] = [];

      parsedData.forEach((row: any) => {
        const email = row.Email?.trim();
        const username = row.FirstName?.trim() + " " + row.LastName?.trim();

        // Validate that both email and username are present
        if (!email || !username) {
          toast.error("Email or Username is missing in some rows.", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
          return;
        }

        // Check for duplicate emails
        if (currentMembers.some((member) => member.email === email)) {
          toast.error(`User with email ${email} already added.`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
          return;
        }

        newMembers.push({ email, username });
      });

      // Add valid members to the current list
      if (newMembers.length > 0) {
        setCurrentMembers([...currentMembers, ...newMembers]);

        toast.success("Users added successfully.", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <form className="w-full mt-4" ref={createTeamForm}>
      {/* Department section */}
      <div className="flex flex-col pb-5">
        <label htmlFor="" className="text-sm">
          Department name
        </label>
        <input
          name="departmentName"
          type="text"
          required
          className="px-3 py-1.5 border rounded-lg outline-none mt-1 border-gray-300"
        />
      </div>
      {/* Team basic information section */}
      <div className="flex items-center w-full gap-4">
        <div className="flex flex-col w-1/2">
          <label className="text-sm">Team name</label>
          <input
            type="text"
            required
            name="teamName"
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          />
        </div>
        <div className="flex flex-col w-1/2">
          <label className="text-sm"> Community the team serves</label>
          <input
            type="text"
            required
            name="teamCommunity"
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          />
        </div>
      </div>

      {/* Team description section with character counter */}
      <div className="mt-4">
        <label>Team descriptions</label>
        <TextareaAutosize
          name="teamDescription"
          required
          minRows={4}
          // maxLength={maxDescriptionLength}
          className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          onChange={(e) => setDescriptionCount(e.target.value.length)}
        />
        <span className="text-sm text-gray-400">
          {maxDescriptionLength - descriptionCount} characters left
        </span>
      </div>

      {/* Team mission section with character counter */}
      <div className="w-full mt-4">
        <label>Team mission</label>
        <TextareaAutosize
          name="teamMission"
          required
          minRows={4}
          // maxLength={maxMissionLength}
          className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          onChange={(e) => setMissionCount(e.target.value.length)}
        />
        <span className="text-sm text-gray-400">
          {maxMissionLength - missionCount} characters left
        </span>
      </div>

      {/* Team members section */}
      <div className="w-full mt-4">
        <label>Members</label>
        <div className="flex flex-col w-full gap-5">
          {/* Individual member addition section */}
          <div className="flex flex-col w-full gap-5">
            {/* Email input */}
            <div className="relative">
              <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                <Email />
              </div>
              <input
                name="email"
                placeholder="Email"
                type="text"
                className="px-3 py-1.5 pl-10 w-full border rounded-lg outline-none mt-1 border-gray-300"
              />
            </div>

            {/* Name inputs (first and last name) */}
            <div className="flex items-center w-full gap-5">
              <div className="relative w-full">
                <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                  <Profile />
                </div>
                <input
                  name="firstName"
                  placeholder="First Name"
                  type="text"
                  className="px-3 py-1.5 pl-10 w-full  border rounded-lg outline-none mt-1 border-gray-300"
                />
              </div>
              <div className="relative w-full">
                <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                  <Profile />
                </div>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  type="text"
                  className="px-3 py-1.5 pl-10 w-full border rounded-lg outline-none mt-1 border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Bulk Upload Section */}
          <div className="flex flex-col w-full gap-3">
            <label className="text-sm">Upload Excel File</label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="px-3 py-1.5 w-full border rounded-lg outline-none border-gray-300"
            />
          </div>

          {/* Current members list display */}
          {currentMembers.length > 0 && (
            <CurrentMembers
              currentMembers={currentMembers}
              handleDeleteMember={handleDeleteMember}
            />
          )}

          {/* Form action buttons */}
          <div className="flex flex-col items-end justify-end w-full gap-4">
            <button
              type="button"
              onClick={handleAddUser}
              className="flex items-center justify-center !w-full font-normal text-white rounded-full btn-primary bg-Turquoise"
            >
              Add user
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className={`btn-primary !w-full ${
                currentMembers.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={currentMembers.length === 0}
            >
              {currentMembers.length === 0
                ? "Add at least one member to create team"
                : "Create Team"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateTeamForm;
