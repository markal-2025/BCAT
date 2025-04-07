import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { styled, TextareaAutosize } from "@mui/material";
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
const InitiateDialog = ({
  handleOpen,
  handleClose,
  selectedTeams,
  loading,
  open,
  guidelines,
  setGuidelines,
  initiatePromise,
  initiateSurvey,
  surveyLoading,
}: {
  handleOpen: () => void;
  handleClose: () => void;
  selectedTeams: number[];
  loading: boolean;
  open: boolean;
  guidelines: string;
  setGuidelines: (value: string) => void;
  initiatePromise: () => Promise<void>;
  initiateSurvey: () => Promise<void>;
  surveyLoading: boolean;
}) => {
  return (
    <>
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
        <DialogTitle className="!pb-0 !font-medium !text-2xl">
          Write Your Input
        </DialogTitle>
        <DialogContent>
          <TextareaAutosize
            value={guidelines}
            minRows={3}
            autoFocus
            required
            id="guideLines"
            name="guideLines"
            onChange={(e) => setGuidelines(e.target.value)}
            className="w-full p-4 mt-4 border border-gray-400 rounded-md"
            placeholder="Start typing here (Press Enter for a new line)"
          />
        </DialogContent>
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
            onClick={initiatePromise}
            disabled={loading}
          >
            {loading ? (
              <ClipLoader color="#fff" size={20} />
            ) : (
              "Initiate Promise"
            )}
          </button>
        </div>
      </BootstrapDialog>
      <div className="flex flex-col items-center justify-end gap-4 mt-4 md:flex-row">
        <button
          onClick={handleOpen}
          disabled={selectedTeams.length == 0}
          className={`  btn-primary !w-full md:!w-fit ${
            selectedTeams.length == 0 ? "!bg-gray-300 " : ""
          }`}
        >
          initiate Promise
        </button>
        <button
          onClick={initiateSurvey}
          disabled={selectedTeams.length == 0}
          className={`  btn-primary !w-full md:!w-fit ${
            selectedTeams.length == 0 ? "!bg-gray-300 " : ""
          }`}
        >
          {surveyLoading ? (
            <ClipLoader color="#fff" size={20} />
          ) : (
            "Initiate Survey"
          )}{" "}
        </button>
      </div>
    </>
  );
};

export default InitiateDialog;
