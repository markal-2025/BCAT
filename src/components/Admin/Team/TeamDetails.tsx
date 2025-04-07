import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Member, Team, useAuth } from "../../../contexts/Auth";
import Edit from "../../../icons/Edit";
import Trash from "../../../icons/Trash";
import Swal from "sweetalert2";
import api from "../../../../utils/api";
import { Dialog, DialogContent, DialogTitle, styled } from "@mui/material";
import CurrentMembers from "./CurrentMembers";
import Profile from "../../../icons/Profile";
import Email from "../../../icons/Email";
import { ClipLoader } from "react-spinners";
import RoleTargetDialog from "./RoleTarget";
import { MoreVert } from "@mui/icons-material";
import { z } from "zod"; // Add Zod import
import { toast } from "react-toastify";

// Define the validation schema
const userSchema = z.object({
  username: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email format"),
});

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
 * TeamDetails.tsx
 *
 * This component provides an interface for administrators to manage team details,
 * including team members and their permissions. It allows for viewing, editing,
 * and deleting team members, as well as setting role targets for surveys.
 *
 * Key features:
 * - Displays a list of all team members with their information
 * - Provides inline editing capabilities for member details
 * - Supports adding new members to the team
 * - Allows for member removal with confirmation
 * - Includes role target setting for team surveys
 * - Links to survey results
 */

/**
 * TeamDetails component for managing team members and settings
 *
 * This component fetches and displays team information, and provides
 * an interface for administrators to manage team composition and settings.
 */
const TeamDetails = () => {
  const { teamId, id } = useParams();
  const { currentOrganization, getOrganization } = useAuth();
  const [team, setTeam] = useState<Team | undefined>(undefined);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editedUsername, setEditedUsername] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [userDialog, setUserDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<any | undefined>(
    undefined
  );
  const [currentUsers, setCurrentUsers] = useState<
    {
      username: string;
      email: string;
    }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<
    | undefined
    | {
        username: string;
        email: string;
      }
  >(undefined);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  // Add validation error state
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!currentOrganization && id) {
      getOrganization(parseInt(id));
    }
    if (!currentSurvey && teamId) {
      const getSurvey = async () => {
        const res = await api.get(
          `/api/v1/team/getTeamSurvey?teamId=${teamId}`
        );
        setCurrentSurvey(res.data);
      };
      getSurvey();
    }
  }, [id, teamId]);

  useEffect(() => {
    if (currentOrganization && teamId) {
      const foundTeam = currentOrganization.teams.find(
        (team: Team) => team.id === parseInt(teamId)
      );
      setTeam(foundTeam);
    }
  }, [teamId, currentOrganization]);

  // Close the action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenActionMenu(null);
      }
    }

    // Only add the listener when a menu is open
    if (openActionMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openActionMenu]); // Add openActionMenu as a dependency

  const handleEdit = (member: Member) => {
    setEditingMemberId(member.id);
    setEditedUsername(member.username);
    setEditedEmail(member.email);
  };

  /**
   * Saves changes made to a team member's details
   *
   * Checks if changes were made before sending API request,
   * then updates the local state and shows a success notification
   */
  const handleSave = async () => {
    if (!editingMemberId || !team) return;

    // Find the original member data
    const originalMember = team.members.find((m) => m.id === editingMemberId);
    if (!originalMember) return;

    // Validate the edited data
    try {
      userSchema.parse({
        username: editedUsername,
        email: editedEmail,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        Swal.fire({
          title: "Validation Error!",
          text: error.errors[0].message,
          icon: "error",
        });
        return;
      }
    }

    // Check if any changes were made
    if (
      editedUsername === originalMember.username &&
      editedEmail === originalMember.email
    ) {
      setEditingMemberId(null);
      return;
    }

    try {
      await api.patch("/api/v1/auth/updateUser", {
        id: editingMemberId,
        username: editedUsername,
        email: editedEmail,
      });

      setTeam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.map((member) =>
            member.id === editingMemberId
              ? { ...member, username: editedUsername, email: editedEmail }
              : member
          ),
        };
      });

      setEditingMemberId(null);
      Swal.fire({
        title: "Updated!",
        text: "Member details have been updated.",
        icon: "success",
      });
      getOrganization(parseInt(id!));
    } catch (error) {
      console.error("Update failed:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update member details.",
        icon: "error",
      });
    }
  };

  /**
   * Opens a confirmation dialog before deleting a team member
   *
   * Uses SweetAlert to confirm the action before proceeding
   *
   * @param member - The member to be deleted
   */
  const handleClickOpen = async (member: Member) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteUserFromTeam(member.id);
        Swal.fire({
          title: "Deleted!",
          text: "Your Member has been deleted.",
          icon: "success",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "Your Member is safe.",
          icon: "info",
        });
      }
    });
  };

  /**
   * Removes a user from the team
   *
   * Sends API request to remove the user and updates local state
   *
   * @param userId - ID of the user to remove
   */
  const deleteUserFromTeam = async (userId: number) => {
    try {
      await api.patch("/api/v1/team/removeUser", {
        teamId: team?.id,
        userId,
      });
      setTeam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members.filter((member) => member.id !== userId),
        };
      });
    } catch (error) {
      toast.error("Failed to delete user from team");
    }
  };

  /**
   * Removes a user from the current users list before submission
   *
   * @param index - Index of the user to remove
   */
  const handleDeleteMember = (index: number) => {
    setCurrentUsers((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Validates and adds a user to the current users list
   *
   * Checks for empty fields, valid email format, and existing emails
   */
  const handleAddUser = () => {
    if (!currentUser) return;

    try {
      // Validate the user input
      userSchema.parse(currentUser);

      // Check if the email already exists in the current users list
      const emailExists = currentUsers.some(
        (user) => user.email === currentUser.email
      );
      if (emailExists) {
        setValidationError("This email is already in the list");
        return;
      }

      // If validation passes, add the user
      setCurrentUsers([...currentUsers, currentUser]);
      setCurrentUser(undefined);
      setValidationError("");
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      } else {
        setValidationError("Invalid input");
      }
    }
  };

  /**
   * Adds new users to the team
   *
   * Sends API request to add users and updates local state
   */
  const handleAddUsers = async () => {
    if (currentUsers.length === 0) {
      setValidationError("Please add at least one user");
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch("/api/v1/team/assignUser", {
        teamId: team?.id,
        teamMembers: currentUsers,
      });
      setLoading(false);
      setUserDialog(false);

      // Construct a clear message about the results
      let successMessage = "Users have been added to the team.";
      if (res.data.duplicateUsersFound) {
        const addedCount = res.data.users.length;
        const attemptedCount = currentUsers.length;
        const duplicateCount = attemptedCount - addedCount;

        if (duplicateCount > 0) {
          successMessage = `${addedCount} out of ${attemptedCount} users were added. ${duplicateCount} ${
            duplicateCount === 1 ? "user was" : "users were"
          } skipped because they already exist in the team.`;
        }
      }

      Swal.fire({
        title: "Success!",
        text: successMessage,
        icon: "success",
      });

      setTeam((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: [
            ...prev.members,
            ...res.data.users.map((user: any) => ({
              id: user.email,
              username: user.username,
              email: user.email,
            })),
          ],
        };
      });
      setCurrentUsers([]);
      setValidationError("");
    } catch (error) {
      setLoading(false);
      console.error("Failed to add users:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to add users to the team.",
        icon: "error",
      });
    }
  };
  const [roleTargetDialog, setRoleTargetDialog] = useState(false);
  /**
   * Submits role target settings for the team
   *
   * Sends API request to set role targets and initiates survey
   *
   * @param selectedRanks - Selected rank settings
   * @param selectedPercentages - Selected percentage settings
   */
  const handleRoleTargetSubmit = async (
    selectedRanks: any,
    selectedPercentages: any
  ) => {
    try {
      await api.post("/api/v1/survey/setRoleTarget", {
        teamId,
        ranks: selectedRanks,
        percentages: selectedPercentages,
      });
      Swal.fire({
        title: "Success!",
        text: "Role target has been set and the survey has been sent.",
        icon: "success",
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.response.data.error,
        icon: "error",
      });
    } finally {
      setRoleTargetDialog(false);
    }
  };

  // Clear validation error when dialog is closed
  const handleCloseDialog = () => {
    setUserDialog(false);
    setValidationError("");
    setCurrentUser(undefined);
  };

  return (
    team && (
      <div className="p-2 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-medium text-gray-400 ">
            {team.name[0].toUpperCase() + team.name.slice(1)}
          </h1>
          <button
            className="btn-primary !w-fit"
            onClick={() => setUserDialog(true)}
          >
            Add Users
          </button>
        </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-12 px-4 text-sm text-gray-500">
            <div className="col-span-5 md:col-span-5 sm:col-span-5">Member</div>
            <div className="col-span-5 md:col-span-5 sm:col-span-5">Email</div>
            <div className="col-span-2 md:col-span-2 sm:col-span-2">
              Actions
            </div>
          </div>

          {team.members.map((member) => (
            <div
              key={member.id}
              className="grid items-center grid-cols-12 px-4 py-4 bg-white rounded-lg shadow-sm"
            >
              <div className="col-span-5 truncate md:col-span-5 sm:col-span-5">
                {editingMemberId === member.id ? (
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    className="w-full p-2 border rounded outline-none"
                  />
                ) : (
                  member.username
                )}
              </div>

              <div className="col-span-5 md:col-span-5 sm:col-span-5">
                {editingMemberId === member.id ? (
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="w-full p-2 border rounded outline-none"
                  />
                ) : (
                  <div className="text-gray-500 truncate">{member.email}</div>
                )}
              </div>

              <div className="relative flex justify-end col-span-2 gap-2 md:col-span-2 sm:col-span-2">
                {/* Desktop view - show buttons directly */}
                <div className="hidden gap-2 md:flex">
                  <button
                    onClick={() => {
                      editingMemberId === member.id
                        ? handleSave()
                        : handleEdit(member);
                    }}
                    className="p-2 rounded hover:bg-gray-100"
                    aria-label={editingMemberId === member.id ? "Save" : "Edit"}
                  >
                    {editingMemberId === member.id ? (
                      <span className="text-green-600">Save</span>
                    ) : (
                      <Edit />
                    )}
                  </button>
                  <button
                    onClick={() => handleClickOpen(member)}
                    className="p-2 rounded hover:bg-gray-100"
                    disabled={editingMemberId === member.id}
                    aria-label="Delete"
                  >
                    <Trash />
                  </button>
                </div>

                {/* Mobile view - show dropdown menu */}
                <div className="md:hidden">
                  <button
                    onClick={() =>
                      setOpenActionMenu(
                        openActionMenu === member.id ? null : member.id
                      )
                    }
                    className="p-2 rounded hover:bg-gray-100"
                    aria-label="More actions"
                  >
                    <MoreVert />
                  </button>

                  {openActionMenu === member.id && (
                    <div
                      ref={actionMenuRef}
                      className="absolute right-0 z-10 py-1 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-36"
                      style={{ transform: "translateZ(0)" }} // Force GPU acceleration
                    >
                      <button
                        onClick={() => {
                          editingMemberId === member.id
                            ? handleSave()
                            : handleEdit(member);
                          setOpenActionMenu(null);
                        }}
                        className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        disabled={
                          editingMemberId === member.id &&
                          openActionMenu !== member.id
                        }
                      >
                        <div className="w-4 h-4">
                          <Edit />
                        </div>
                        {editingMemberId === member.id ? "Save" : "Edit"}
                      </button>
                      <button
                        onClick={() => {
                          handleClickOpen(member);
                          setOpenActionMenu(null);
                        }}
                        className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        disabled={editingMemberId === member.id}
                      >
                        <div className="w-4 h-4">
                          <Trash />
                        </div>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {userDialog && (
          <>
            <BootstrapDialog
              onClose={handleCloseDialog}
              aria-labelledby="customized-dialog-title"
              open={userDialog}
              className="responsive-dialog"
              PaperProps={{
                style: {
                  width: "80%",
                  minWidth: "300px",
                },
              }}
            >
              <DialogTitle className="!pb-0 !font-medium !text-2xl">
                Add New Members
              </DialogTitle>
              <DialogContent className="mt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative w-full">
                    <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                      <Email />
                    </div>
                    <input
                      name="email"
                      required
                      placeholder="Email"
                      type="text"
                      value={currentUser?.email || ""}
                      onChange={(e) => {
                        setCurrentUser({
                          email: e.target.value,
                          username: currentUser?.username || "",
                        });
                      }}
                      className="px-3 py-1.5 pl-10 w-full border rounded-lg outline-none mt-1 border-gray-300"
                    />
                  </div>
                  <div className="relative w-full">
                    <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                      <Profile />
                    </div>
                    <input
                      name="username"
                      placeholder="Name"
                      type="text"
                      required
                      onChange={(e) => {
                        setCurrentUser({
                          username: e.target.value,
                          email: currentUser?.email || "",
                        });
                      }}
                      value={currentUser?.username || ""}
                      className="px-3 py-1.5 pl-10 w-full border rounded-lg outline-none mt-1 border-gray-300"
                    />
                  </div>
                </div>
                {validationError && (
                  <div className="mt-2 text-sm text-red-500">
                    {validationError}
                  </div>
                )}
                <button className="mt-4 btn-primary" onClick={handleAddUser}>
                  Add User
                </button>
              </DialogContent>
              {currentUsers.length > 0 && (
                <CurrentMembers
                  currentMembers={currentUsers}
                  handleDeleteMember={handleDeleteMember}
                />
              )}
              <div className="flex flex-col items-center justify-center gap-4 p-4 md:justify-end md:flex-row">
                <button
                  onClick={handleCloseDialog}
                  type="button"
                  className="btn-primary !bg-white !px-8   !text-Turquoise md:!w-fit !w-full border border-Turquoise"
                >
                  Back
                </button>
                <button
                  className="btn-primary !px-12 md:!w-fit !w-full border border-Turquoise"
                  onClick={handleAddUsers}
                  disabled={loading}
                >
                  {loading ? <ClipLoader color="#fff" size={20} /> : "Submit"}
                </button>
              </div>
            </BootstrapDialog>
          </>
        )}
        <div className="flex flex-col items-center gap-1 md:gap-4 md:flex-row">
          <button
            className="btn-primary !w-full md:!w-fit mt-6"
            onClick={() => setRoleTargetDialog(true)}
          >
            Set Role Target
          </button>
          <button
            disabled={!currentSurvey}
            className={`${
              currentSurvey
                ? "btn-primary !w-full md:!w-fit md:mt-6 mt-2"
                : " !bg-gray-300 btn-primary !w-full md:!w-fit mt-6"
            }`}
          >
            <Link to={`/surveyResult/${team.id}/${currentSurvey?.id}`}>
              View Survey Results
            </Link>
          </button>
          <button className={`btn-primary !w-full md:!w-fit md:mt-6 mt-2`}>
            <Link to={`/organizations/${id}/teams/${teamId}/promises`}>
              View Promises Results
            </Link>
          </button>
        </div>
        <RoleTargetDialog
          open={roleTargetDialog}
          onClose={() => setRoleTargetDialog(false)}
          onSubmit={handleRoleTargetSubmit}
        />
      </div>
    )
  );
};

export default TeamDetails;
