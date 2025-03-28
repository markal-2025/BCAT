import { useState, useRef, useEffect } from "react";
import Edit from "../../../icons/Edit";
import Trash from "../../../icons/Trash";
import { Link } from "react-router-dom";
import { OrganizationType } from "./ManageOrganization"; // Import the type from your component
import { MoreVert } from "@mui/icons-material";

interface ActionsMenuProps {
  org: OrganizationType;
  onDelete: (org: OrganizationType) => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ org, onDelete }) => {
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

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click event
    setIsOpen(false);
    onDelete(org);
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
            <Link
              to={`/organizations/manage/${org.id}`}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent row click event
            >
              <div className="w-4 h-4 mr-2">
                <Edit />
              </div>
              Edit
            </Link>
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

export default ActionsMenu;
