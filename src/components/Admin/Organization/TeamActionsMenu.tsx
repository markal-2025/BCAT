import { useState, useRef, useEffect } from "react";
import Edit from "../../../icons/Edit";
import Trash from "../../../icons/Trash";
import Bell from "../../../icons/Bell";
import { MoreVert } from "@mui/icons-material";
import { Team } from "../../../contexts/Auth";

interface TeamActionsMenuProps {
  team: Team;
  editingTeamId: number | null;
  onEdit: (team: any) => void;
  onDelete: (team: any) => void;
  onReminder: (teamId: number) => void;
}

const TeamActionsMenu: React.FC<TeamActionsMenuProps> = ({
  team,
  editingTeamId,
  onEdit,
  onDelete,
  onReminder,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click event
    setIsOpen(!isOpen);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click event
    setIsOpen(false);
    onEdit(team);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click event
    setIsOpen(false);
    onDelete(team);
  };

  const handleReminderClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click event
    setIsOpen(false);
    onReminder(team.id!);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label="Actions"
      >
        <MoreVert />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 bg-white rounded-md shadow-lg w-36 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleReminderClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="w-4 h-4 mr-2">
                <Bell />
              </div>
              Reminder
            </button>
            <button
              onClick={handleEditClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {editingTeamId === team.id ? (
                <span className="flex items-center justify-center w-4 h-4 mr-2 text-green-600">
                  ✓
                </span>
              ) : (
                <div className="w-4 h-4 mr-2">
                  <Edit />
                </div>
              )}
              {editingTeamId === team.id ? "Save" : "Edit"}
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <div className="w-4 h-4 mr-2">
                <Trash />
              </div>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamActionsMenu;
