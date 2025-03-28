import { styled } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CreateTeam from "../Team/CreateTeam";
import { Team } from "./CreateOrganization";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/Auth";
import api from "../../../../utils/api";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
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
const CreateTeamDialog = ({
  open,
  handleClose,
  savedTeams,
  setSavedTeams,
}: {
  open: boolean;
  handleClose: () => void;
  savedTeams: Team[];
  setSavedTeams: any;
}) => {
  const { currentOrganization, getOrganization } = useAuth();
  const [loading, setLoading] = useState(false);
  const createTeams = async () => {
    setLoading(true);
    try {
      const organizationId = currentOrganization.organization.id;

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
      toast.success("Teams created successfully!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      getOrganization(currentOrganization.organization.id);
    } catch (error) {
      toast.error("Error creating  teams", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setLoading(false);
      setSavedTeams([]);
      handleClose();
    }
    // Show success message
  };
  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      className="responsive-dialog"
      PaperProps={{
        style: {
          width: "80%",
          minWidth: "300px",
        },
      }}
    >
      <DialogContent>
        <CreateTeam savedTeams={savedTeams} setSavedTeams={setSavedTeams} />
        <div className="flex flex-col items-center justify-center gap-4 p-4 md:justify-end md:flex-row">
          <button
            onClick={handleClose}
            type="button"
            className="btn-primary !bg-white !px-8   !text-Turquoise md:!w-fit !w-full border border-Turquoise"
          >
            Back
          </button>
          <button
            className="btn-primary !px-12 md:!w-fit !w-full border border-Turquoise"
            onClick={createTeams}
            disabled={loading}
          >
            {loading ? <ClipLoader color="#fff" size={20} /> : "Add Teams"}
          </button>
        </div>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default CreateTeamDialog;
