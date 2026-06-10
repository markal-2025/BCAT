import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useAuth,
  OrganizationData,
  Organization,
} from "../../../contexts/Auth";
import Edit from "../../../icons/Edit";
import Trash from "../../../icons/Trash";
import Swal from "sweetalert2";
import api from "../../../../utils/api";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { z } from "zod"; // Add Zod import

import InitiateDialog from "./InitiateDialog";
import Bell from "../../../icons/Bell";
import ReminderDialog from "./ReminderDialog";
import TeamActionsMenu from "./TeamActionsMenu";
import CreateTeamDialog from "./CreateTeamDialog";
import { Team } from "./CreateOrganization";

// Define the validation schema for team
const teamSchema = z.object({
  name: z.string().trim().min(1, "Team name is required"),
  description: z.string().trim().min(1, "Team description is required"),
});

const OrganizationDetails = ({ initiate }: { initiate?: boolean }) => {
  const [guidelines, setGuidelines] = useState("");
  const { id } = useParams<{ id: string }>();
  const {
    getOrganization,
    currentOrganization,
    handleDeleteTeam,
    setCurrenOrganization,
    promiseStats,
    surveyStats,
    setAcceptedPromises,
    fetchedOrg,
    currentOrganizationNotFound,
    setCurrentOrganizationNotFound,
  } = useAuth();
  // Get auth context safely
  const auth = useAuth();

  // Early return with loading state if auth is not available yet
  if (!auth) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <ClipLoader color="#4F46E5" size={40} />
      </div>
    );
  }

  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedName, setEditedName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [savedTeams, setSavedTeams] = useState<Team[]>([]);

  const [createTeamDialog, setCreateTeamDialog] = useState(false);
  const [reminderTeamId, setReminderTeamId] = useState<number | null>(null); // New state for storing team ID
  const [validationError, setValidationError] = useState(""); // New state for validation errors
  const navigate = useNavigate();
  useEffect(() => {
    setCurrenOrganization(null);
    setCurrentOrganizationNotFound(false);
    setAcceptedPromises([]);
    if (id) getOrganization(parseInt(id));
  }, [id]);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen = async (team: Team) => {
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
        await handleDeleteTeam(team.id!);
        Swal.fire({
          title: "Deleted!",
          text: "Your Team has been deleted.",
          icon: "success",
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "Your Team is safe.",
          icon: "info",
        });
      }
    });
  };

  const handleEdit = async (team: Team) => {
    if (editingTeamId === team.id) {
      try {
        // Validate the team data
        try {
          teamSchema.parse({
            name: editedName,
            description: editedDescription,
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast.error(error.errors[0].message);
            return;
          }
        }

        if (
          editedName === team.name &&
          editedDescription === team.teamDescription
        ) {
          setEditingTeamId(null);
          setValidationError("");
          return;
        }

        await api.patch(`/api/v1/team/updateTeam?teamId=${team.id}`, {
          teamDescription: editedDescription,
          teamName: editedName,
        });

        setCurrenOrganization((prev: OrganizationData) => ({
          ...prev,
          teams: prev.teams.map((t) =>
            t.id === team.id
              ? { ...t, teamDescription: editedDescription, name: editedName }
              : t
          ),
        }));

        toast.success("Team updated successfully");
        setEditingTeamId(null);
        setValidationError("");
      } catch (error) {
        console.error(error);
        toast.error("Failed to update team");
      }
    } else {
      setEditingTeamId(team.id!);
      setEditedDescription(team.teamDescription || "");
      setEditedName(team.name);
      setValidationError("");
    }
  };

  // Handle input changes with validation feedback
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedName(value);

    if (value.trim() === "") {
      setValidationError("Team name cannot be empty");
    } else if (editedDescription.trim() === "") {
      setValidationError("Team description cannot be empty");
    } else {
      setValidationError("");
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedDescription(value);

    if (value.trim() === "") {
      setValidationError("Team description cannot be empty");
    } else if (editedName.trim() === "") {
      setValidationError("Team name cannot be empty");
    } else {
      setValidationError("");
    }
  };

  const handleDelete = async (org: Organization) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/v1/org/deleteOrganization?id=${org.id}`);
        Swal.fire("Deleted!", "Your Organization has been deleted.", "success");
      } catch (error) {
        toast.error("Failed to delete organization");
      }
    }
  };
  const handleTeamClick = (e: React.MouseEvent, teamId: number) => {
    if (!initiate) return;

    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea")
    ) {
      return;
    }

    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const initiatePromise = async () => {
    try {
      setLoading(true);
      await api.post("/api/v1/survey/createPromise", {
        teamIds: selectedTeams,
        orgId: currentOrganization.organization.id,
        guideLines: guidelines,
      });
      setOpen(false);
      toast.success("Promise initiated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const initiateSurvey = async () => {
    try {
      setSurveyLoading(true);
      await api.post("/api/v1/survey/createSurvey", {
        teamIds: selectedTeams,
        orgId: currentOrganization.organization.id,
      });
      toast.success("Survey initiated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.error);
    } finally {
      setSurveyLoading(false);
    }
  };

  const sendReminder = async () => {
    setLoading(true);
    try {
      if (reminderTeamId !== null) {
        await api.post("/api/v1/survey/sendReminder", {
          teamId: reminderTeamId,
          content: reminderMessage,
        });
        toast.success("Reminder sent successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reminder");
    } finally {
      setLoading(false);
      setReminderDialog(false);
    }
  };
  const handleOpenReminder = (teamId: number) => {
    setReminderDialog(true);
    setReminderTeamId(teamId);
  };
  return !fetchedOrg ? (
    <div className="flex items-center justify-center h-[200px]">
      <ClipLoader color="#4F46E5" size={40} />
    </div>
  ) : fetchedOrg && currentOrganization ? (
    <div className="p-2 pt-4">
      {!initiate && (
        <div className="flex items-center justify-between w-full">
          <h1 className="mb-6 text-3xl font-medium text-gray-400">
            {currentOrganization.organization.name[0].toUpperCase() +
              currentOrganization.organization.name.slice(1)}
          </h1>
          <button
            onClick={() => setCreateTeamDialog(true)}
            className="btn-primary !w-fit"
          >
            Add Team
          </button>
        </div>
      )}
      {!initiate && createTeamDialog && (
        <CreateTeamDialog
          handleClose={() => setCreateTeamDialog(false)}
          open={createTeamDialog}
          savedTeams={savedTeams}
          setSavedTeams={setSavedTeams}
        />
      )}

      {initiate && (
        <>
          <div className="hidden grid-cols-12 px-4 text-sm text-gray-500 md:grid">
            <div className="col-span-4">Name</div>
            {/* <div className="col-span-3">Description</div> */}
            <div className="col-span-3">Date Created</div>
            <div className="col-span-3 text-center">Teams</div>
            <div className="col-span-2">Actions</div>
          </div>
          <div
            className={`grid items-center mb-12 grid-cols-12 px-4 py-4 bg-white rounded-lg shadow-sm ${
              initiate ? "cursor-pointer hover:bg-gray-50" : ""
            }`}
          >
            <div className="col-span-4 font-medium break-words whitespace-normal">
              {currentOrganization.organization.name}
            </div>
            {/* <div className="col-span-3 text-gray-600 break-words whitespace-normal">
              {currentOrganization.organization.description ||
                "Lorem ipsum dolor sit amet consectetur, adipisicing elit..."}
            </div> */}
            <div className="col-span-3">
              {new Date(
                currentOrganization.organization.createdAt
              ).toLocaleDateString()}
            </div>
            <div className="col-span-3 text-center">
              {currentOrganization.teams.length}
            </div>
            <div className="flex col-span-2 gap-2">
              <Link
                to={`/organizations/manage/${currentOrganization.organization.id}`}
                className="p-2 rounded hover:bg-gray-100"
              >
                <Edit />
              </Link>
              <button
                onClick={() => handleDelete(currentOrganization.organization)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <Trash />
              </button>
            </div>
          </div>
        </>
      )}

      <div className="grid gap-4">
        <div className="hidden grid-cols-12 px-4 text-sm text-gray-500 md:grid">
          <div className="col-span-2">Team</div>
          <div className="col-span-2">Description</div>
          <div className="col-span-1">Surveys</div>
          <div className="col-span-1">Promise</div>
          <div className="col-span-2">Date Created</div>
          <div className="col-span-2">Members</div>
          <div className="col-span-2">Actions</div>
        </div>
        {currentOrganization.teams.map((team) => {
          const surveyResult = surveyStats.find((s) => s.team_id === team.id);
          const promiseResult = promiseStats.find((s) => s.team_id === team.id);
          return (
            <div
              key={team.id}
              className={`grid items-center grid-cols-6 md:grid-cols-12 px-4 py-4 bg-white rounded-lg shadow-sm transition-colors ${
                initiate ? "cursor-pointer border-2" : ""
              } ${
                selectedTeams.includes(team.id!)
                  ? "border-red-500"
                  : "border-transparent"
              }`}
              onClick={(e) => handleTeamClick(e, team.id!)}
            >
              {/* Mobile view */}
              <div className="flex flex-col col-span-5 md:hidden">
                <div className="font-medium">
                  {editingTeamId === team.id ? (
                    <div>
                      <input
                        type="text"
                        value={editedName}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleNameChange}
                        className={`w-full p-2 bg-transparent border rounded outline-none ${
                          editedName.trim() === ""
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                  ) : (
                    team.name
                  )}
                </div>

                {editingTeamId === team.id ? (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={editedDescription}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleDescriptionChange}
                      className={`w-full p-2 bg-transparent border rounded outline-none ${
                        editedDescription.trim() === ""
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-gray-600 truncate">
                    {team.teamDescription || "No description..."}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1 font-medium">Created:</span>
                    {new Date(team.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 font-medium">Members:</span>
                    <Link
                      to={`/organizations/manage/${currentOrganization.organization.id}/${team.id}`}
                      className="underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {team.members?.length || 0}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <div className="flex items-center">
                    <span className="mr-1 font-medium">Survey:</span>
                    <span
                      className={
                        surveyResult ? "text-gray-700" : "text-gray-500"
                      }
                    >
                      {surveyResult
                        ? `${
                            surveyResult.total_users -
                            surveyResult.remaining_users
                          } / ${surveyResult.total_users}`
                        : "No Survey"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 font-medium">Promise:</span>
                    <span
                      className={
                        promiseResult ? "text-gray-700" : "text-gray-500"
                      }
                    >
                      {promiseResult
                        ? `${
                            promiseResult.total_users -
                            promiseResult.remaining_users
                          } / ${promiseResult.total_users}`
                        : "No Promise"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile actions menu */}
              <div className="flex justify-end col-span-1 md:hidden">
                <TeamActionsMenu
                  team={team}
                  editingTeamId={editingTeamId}
                  onEdit={handleEdit}
                  onDelete={handleClickOpen}
                  onReminder={handleOpenReminder}
                />
              </div>

              {/* Desktop view */}
              <div className="hidden col-span-2 md:block">
                {editingTeamId === team.id ? (
                  <div>
                    <input
                      type="text"
                      value={editedName}
                      onChange={handleNameChange}
                      className={`w-full p-2 bg-transparent border rounded outline-none ${
                        editedName.trim() === ""
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  team.name
                )}
              </div>

              <div className="hidden col-span-2 md:block">
                {editingTeamId === team.id ? (
                  <div>
                    <input
                      type="text"
                      value={editedDescription}
                      onChange={handleDescriptionChange}
                      className={`w-full p-2 bg-transparent border rounded outline-none ${
                        editedDescription.trim() === ""
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <div className="text-gray-500 truncate">
                    {team.teamDescription || "Lorem ipsum dolor sit amet..."}
                  </div>
                )}
              </div>

              <div className="hidden col-span-1 ml-2 md:block">
                {surveyResult ? (
                  `${
                    surveyResult.total_users - surveyResult.remaining_users
                  } / ${surveyResult.total_users}`
                ) : (
                  <span className="text-gray-500">No Survey</span>
                )}
              </div>

              <div className="hidden col-span-1 ml-2 md:block">
                {promiseResult ? (
                  `${
                    promiseResult.total_users - promiseResult.remaining_users
                  } / ${promiseResult.total_users}`
                ) : (
                  <span className="text-gray-500">No Promise</span>
                )}
              </div>

              <div className="hidden col-span-2 text-gray-500 md:block">
                {new Date(team.createdAt).toLocaleDateString()}
              </div>

              <Link
                to={`/organizations/manage/${currentOrganization.organization.id}/${team.id}`}
                className="hidden col-span-2 text-gray-500 underline underline-offset-2 md:block"
                onClick={(e) => e.stopPropagation()}
              >
                {team.members?.length || 0}
              </Link>

              <div className="items-center hidden col-span-2 gap-1 md:flex">
                <button
                  className="p-1.5 rounded hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReminderDialog(true);
                    setReminderTeamId(team.id!);
                  }}
                >
                  <Bell />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(team);
                  }}
                  className="p-1.5 rounded hover:bg-gray-100"
                  disabled={
                    editingTeamId === team.id &&
                    (editedName.trim() === "" ||
                      editedDescription.trim() === "")
                  }
                >
                  {editingTeamId === team.id ? (
                    <span
                      className={`${
                        editedName.trim() === "" ||
                        editedDescription.trim() === ""
                          ? "text-gray-400"
                          : "text-green-600"
                      }`}
                    >
                      Save
                    </span>
                  ) : (
                    <Edit />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickOpen(team);
                  }}
                  className="p-1.5 rounded hover:bg-gray-100"
                >
                  <Trash />
                </button>
              </div>
              {editingTeamId === team.id && validationError && (
                <div className="col-span-12 text-red-500">
                  {validationError}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {initiate && (
        <InitiateDialog
          handleOpen={handleOpen}
          handleClose={handleClose}
          selectedTeams={selectedTeams}
          loading={loading}
          open={open}
          guidelines={guidelines}
          setGuidelines={setGuidelines}
          initiatePromise={initiatePromise}
          initiateSurvey={initiateSurvey}
          surveyLoading={surveyLoading}
        />
      )}

      {reminderDialog && (
        <ReminderDialog
          handleClose={() => setReminderDialog(false)}
          loading={loading}
          reminder={reminderMessage}
          setReminder={setReminderMessage}
          sendReminder={sendReminder}
        />
      )}
    </div>
  ) : (
    currentOrganizationNotFound && (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <div className="w-16 h-16 mb-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-700">
          Organization Not Found
        </h2>
        <p className="mb-6 text-gray-500">
          The organization you're looking for doesn't exist
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Go Back
        </button>
      </div>
    )
  );
};

export default OrganizationDetails;
