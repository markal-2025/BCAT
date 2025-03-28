import {
  Dialog,
  DialogContent,
  DialogTitle,
  styled,
  TextareaAutosize,
} from "@mui/material";
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

const ReminderDialog = ({
  handleClose,
  loading,
  reminder,
  setReminder,
  sendReminder,
}: {
  handleClose: () => void;
  loading: boolean;
  reminder: string;
  setReminder: (value: string) => void;
  sendReminder: () => Promise<void>;
}) => {
  return (
    <BootstrapDialog
      // onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={true}
      className="responsive-dialog"
      PaperProps={{
        style: {
          width: "80%",
          minWidth: "300px",
        },
      }}
    >
      <DialogTitle className="!pb-0 !font-medium !text-2xl">
        Send a Reminder ?
      </DialogTitle>
      <DialogContent>
        <h2 className="mt-2 text-lg font-medium">
          Customize Message (Optional):
        </h2>
        <TextareaAutosize
          value={reminder}
          minRows={3}
          autoFocus
          required
          id="reminder"
          name="reminder"
          onChange={(e) => setReminder(e.target.value)}
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
          onClick={sendReminder}
          disabled={loading}
        >
          {loading ? <ClipLoader color="#fff" size={20} /> : "Send Reminder"}
        </button>
      </div>
    </BootstrapDialog>
  );
};

export default ReminderDialog;
