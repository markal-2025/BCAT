/**
 * CreateOrganization.tsx
 *
 * This component provides a comprehensive form interface for creating a new organization
 * along with its associated teams and members. It allows administrators to define
 * organization details, create multiple teams, add team members, and specify contact
 * information before submitting the organization for creation.
 *
 * Key features:
 * - Organization details input (name, department)
 * - Team creation with name, community, description, and mission
 * - Member management with individual and bulk addition
 * - Sponsor and contact information collection
 * - Form validation with user feedback
 * - API integration for organization and team creation
 */

import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Bounce } from "react-toastify";
import { ClipLoader } from "react-spinners";
import api from "../../../../utils/api";
import Create from "../../../icons/Create";
import {
  markInvalidFields,
  validateFormFields,
} from "../../../helpers/validateFormFields";
import CreateTeam from "../Team/CreateTeam";
/**
 * Interface representing a team member
 */
export interface Member {
  username: string;
  email: string;
}

/**
 * Interface representing a team with its details and members
 */
export interface Team {
  id?: number;
  name: string;
  community: string;
  teamDescription: string;
  mission: string;
  members: Member[];
}

/**
 * CreateOrganization component for organization creation with teams and members
 */
const CreateOrganization = () => {
  // Navigation hook
  const navigate = useNavigate();

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Team management state
  const [savedTeams, setSavedTeams] = useState<Team[]>([]);

  /**
   * Handles the main organization form submission
   * Creates the organization and associated teams via API calls
   * Includes validation for blank spaces in all fields
   *
   * @param event - The form submission event
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    // Define fields to validate
    const requiredFields = [
      "organizationName",
      "departmentName",
      "sponsorFirstName",
      "sponsorLastName",
      "sponsorEmail",
      "contactFirstName",
      "contactLastName",
      "contactEmail",
      "bcatFacilitatorEmail",
    ];

    // Validate all required fields
    const { isValid, invalidFields } = validateFormFields(form, requiredFields);

    // Mark invalid fields and show error message
    if (!isValid) {
      markInvalidFields(form, invalidFields);
      toast.error(
        "Please fill in all required fields (blank spaces are not allowed).",
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        }
      );
      return;
    }

    if (savedTeams.length === 0) {
      toast.error("Please create at least one team.", {
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

    setIsLoading(true);

    try {
      const formData = new FormData(form);

      // Create the organization
      const organizationResponse = await api.post(
        "/api/v1/org/createOrganization",
        formData,
        { withCredentials: true }
      );

      const organizationId = organizationResponse.data.organization.id;

      // Prepare team creation requests
      const teamRequests = savedTeams.map((team) => {
        const createTeamRequest = {
          orgId: organizationId,
          teamName: team.name,
          teamCommunity: team.community,
          teamDescription: team.teamDescription,
          teamMission: team.mission,
          teamMembers: team.members,
        };
        return api.post("/api/v1/team/createTeam", createTeamRequest, {
          withCredentials: true,
        });
      });

      // Execute all team creation requests concurrently
      await Promise.all(teamRequests);

      // Show success message
      toast.success("Organization and teams created successfully!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      // Navigate to the organization management page
      navigate(`/organizations/manage/${organizationId}`);
    } catch (error) {
      console.error("Error creating organization or teams:", error);
      toast.error(
        "An error occurred while creating the organization or teams.",
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="flex items-center mt-4 font-Titles">
        <Create /> Create a new organization
      </h1>

      {/* Organization name section */}
      <div className="flex flex-col pb-5 mt-4 border-b border-gray-300">
        <label htmlFor="" className="text-sm">
          Organization name
        </label>
        <input
          name="organizationName"
          type="text"
          required
          className="px-3 py-1.5 border rounded-lg outline-none mt-1 border-gray-300"
        />
      </div>

      {/* Department section */}
      <div className="flex flex-col pb-5 mt-4 border-b border-gray-300">
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
      {/* CreateTeam component for team creation */}
      <CreateTeam savedTeams={savedTeams} setSavedTeams={setSavedTeams} />
      {/* Sponsor information section */}
      <div className="flex flex-col gap-2 py-6 border-t border-gray-300">
        <h2>Sponsor</h2>
        <div className="flex items-center w-full gap-4">
          <input
            type="text"
            name="sponsorFirstName"
            placeholder="First name"
            required
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          />
          <input
            type="text"
            name="sponsorLastName"
            placeholder="Last name"
            required
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          />
        </div>
        <div className="pr-4">
          <input
            type="email"
            name="sponsorEmail"
            placeholder="Email"
            required
            className="px-3 py-1.5 w-1/2 border rounded-lg outline-none mt-1 border-gray-300"
          />
        </div>
      </div>

      {/* Contact information section */}
      <div className="flex flex-col gap-2 py-6 border-t border-gray-300">
        <h2>Contact</h2>
        <div className="flex items-center w-full gap-4">
          <input
            type="text"
            name="contactFirstName"
            placeholder="First name"
            required
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          />
          <input
            type="text"
            name="contactLastName"
            placeholder="Last name"
            required
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          />
        </div>
        <div className="pr-4">
          <input
            type="email"
            name="contactEmail"
            placeholder="Email"
            required
            className="px-3 py-1.5 w-1/2 border rounded-lg outline-none mt-1 border-gray-300"
          />
        </div>
      </div>

      {/* BCAT Facilitator and logo section */}
      <div className="flex flex-col gap-2 py-6 border-t border-gray-300">
        <h2>BCAT Facilitator</h2>
        <input
          type="email"
          name="bcatFacilitatorEmail"
          placeholder="Email"
          required
          className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
        />

        <div className="flex flex-col gap-2 mt-2">
          <h3>
            Logo <span className="text-gray-400">(optional)</span>
          </h3>
          <input
            type="file"
            name="image"
            placeholder="Logo"
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          />
        </div>
      </div>

      {/* Submit button */}
      <button type="submit" className="!w-full btn-primary">
        {isLoading ? (
          <div className="flex items-center justify-center w-full">
            <ClipLoader color="#fff" size={25} />
          </div>
        ) : (
          "Create Organization"
        )}{" "}
      </button>
    </form>
  );
};

export default CreateOrganization;
