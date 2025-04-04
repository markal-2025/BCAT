import { useRef, useState } from "react";
import Plus from "../../../icons/Plus";
import { Member, Team } from "../Organization/CreateOrganization";
import {
  markInvalidFields,
  validateFormFields,
} from "../../../helpers/validateFormFields";
import { Bounce, toast } from "react-toastify";
import { List } from "@mui/material";
import SavedTeams from "./SavedTeams";
import CreateTeamForm from "./CreateTeamForm";
import { z } from "zod";

const CreateTeam = ({
  savedTeams,
  setSavedTeams,
}: {
  savedTeams: Team[];
  setSavedTeams: any;
}) => {
  const [currentMembers, setCurrentMembers] = useState<Member[]>([]);
  const [openForm, setOpenForm] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const createTeamForm = useRef<HTMLFormElement>(null);
  /**
   * Handles the team creation form submission
   * Creates a new team and adds it to the saved teams list
   * Includes validation for blank spaces in all fields
   */
  const handleFormSubmit = () => {
    if (createTeamForm.current) {
      const form = createTeamForm.current;

      // Define fields to validate
      const requiredFields = [
        "teamName",
        "departmentName",
        "teamCommunity",
        "teamDescription",
        "teamMission",
      ];

      // Validate all required fields
      const { isValid, invalidFields } = validateFormFields(
        form,
        requiredFields
      );

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

      const formData = new FormData(form);

      const teamName = formData.get("teamName")?.toString() || "";
      const teamCommunity = formData.get("teamCommunity")?.toString() || "";
      const teamDescription = formData.get("teamDescription")?.toString() || "";
      const teamMission = formData.get("teamMission")?.toString() || "";
      const teamDepartment = formData.get("departmentName")?.toString() || "";
      const newTeam: Team = {
        name: teamName,
        community: teamCommunity,
        teamDescription: teamDescription,
        mission: teamMission,
        departmentName: teamDepartment,
        members: currentMembers,
      };
      console.log(newTeam);
      setSavedTeams((prev: any) => [...prev, newTeam]);
      setCurrentMembers([]);
      form.reset();
      setOpenForm(false);
    }
  };
  const handleToggle = (teamName: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [teamName]: !prev[teamName],
    }));
  };
  const handleDeleteMember = (index: number) => {
    const newMembers = [...currentMembers];
    newMembers.splice(index, 1);
    setCurrentMembers(newMembers);
  };

  /**
   * Adds a new user to the current members list from form input
   * Validates email uniqueness and input completeness with trimming
   */
  const handleAddUser = () => {
    if (createTeamForm.current) {
      const form = createTeamForm.current;

      // Define fields to validate
      const requiredFields = ["email", "firstName", "lastName"];

      // Validate all required fields
      const { isValid, invalidFields } = validateFormFields(
        form,
        requiredFields
      );

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

      const formData = new FormData(form);
      const email = formData.get("email") as string;
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const username = `${firstName} ${lastName}`;

      // Check if the email is already in the list
      if (currentMembers.some((member) => member.email === email)) {
        toast.error("User already added.", {
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

      // Add the new member to the state
      setCurrentMembers((prev) => [...prev, { username, email }]);

      toast.success("User added successfully.", {
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

      // Clear the form inputs
      const emailInput = form.elements.namedItem("email") as HTMLInputElement;
      const firstNameInput = form.elements.namedItem(
        "firstName"
      ) as HTMLInputElement;
      const lastNameInput = form.elements.namedItem(
        "lastName"
      ) as HTMLInputElement;

      if (emailInput && firstNameInput && lastNameInput) {
        emailInput.value = "";
        firstNameInput.value = "";
        lastNameInput.value = "";
      }
    }
  };
  const handleUpdateTeam = (updatedTeam: Team, index: number) => {
    const result = z
      .object({
        name: z.string().trim().nonempty(),
        community: z.string().trim().nonempty(),
        teamDescription: z.string().trim().nonempty(),
        departmentName: z.string().trim().nonempty(),
        mission: z.string().trim().nonempty(),
      })
      .safeParse(updatedTeam);
    if (!result.success) {
      toast.error("Team data cannot be empty Check all required fields", {
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
    const newTeams = [...savedTeams];
    newTeams[index] = updatedTeam;
    setSavedTeams(newTeams);

    setOpenSections((prev) => ({
      ...prev,
      [updatedTeam.name]: false,
    }));
  };
  const handleDeleteTeam = (index: number) => {
    const newTeams = [...savedTeams];
    newTeams.splice(index, 1);
    setSavedTeams(newTeams);
  };

  return (
    <>
      {/* Teams section */}
      <div className="flex flex-col w-full pb-4 mt-4">
        <h1 className="my-4 font-medium">Teams</h1>
        {savedTeams.length > 0 && (
          <div className="w-full">
            <List className="flex-grow w-full !font-medium">
              {savedTeams?.map((team, index) => (
                <SavedTeams
                  key={index}
                  team={team}
                  isOpen={!!openSections[team.name]}
                  handleToggle={handleToggle}
                  onUpdateTeam={(updatedTeam) =>
                    handleUpdateTeam(updatedTeam, index)
                  }
                  onDeleteTeam={() => handleDeleteTeam(index)}
                />
              ))}
            </List>
          </div>
        )}
        {(savedTeams.length == 0 || openForm) && (
          <>
            <CreateTeamForm
              createTeamForm={createTeamForm}
              handleAddUser={handleAddUser}
              handleFormSubmit={handleFormSubmit}
              currentMembers={currentMembers}
              handleDeleteMember={handleDeleteMember}
              setCurrentMembers={setCurrentMembers}
            />
          </>
        )}
      </div>

      {/* Add another team button */}
      {savedTeams.length > 0 && !openForm && (
        <div className="flex items-center justify-end w-full mb-4">
          <button onClick={() => setOpenForm(true)} className="btn-secondary">
            <Plus />
            Add another team
          </button>
        </div>
      )}
    </>
  );
};

export default CreateTeam;
