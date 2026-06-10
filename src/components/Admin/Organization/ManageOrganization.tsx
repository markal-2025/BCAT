import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import Edit from "../../../icons/Edit";
import Trash from "../../../icons/Trash";
import ActionsMenu from "./ActionMenu";

export type OrganizationType = {
  name: string;
  description: string;
  createdAt: string;
  id: number;
  teams: [];
};

const ManageOrganization = ({ inititate }: { inititate?: boolean }) => {
  const [sortBy, setSortBy] = useState("Most Recent");
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<OrganizationType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/v1/org/getOrganizations");
        setOrganizations(response.data.organizations);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  const handleRowClick = (org: OrganizationType, e: React.MouseEvent) => {
    if (inititate) {
      // Check if click was on a button or link
      const isActionElement = (e.target as HTMLElement).closest("button, a");
      if (!isActionElement) {
        navigate(`/initiate/${org.id}`);
      }
    }
  };

  const handleDelete = async (org: OrganizationType) => {
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
        setOrganizations(organizations.filter((o) => o.id !== org.id));
        Swal.fire("Deleted!", "Your Organization has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Your Organization has not been deleted.", "error");
      }
    }
  };

  useEffect(() => {
    let sorted = [...organizations];
    switch (sortBy) {
      case "Most Recent":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "Name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Teams":
        sorted.sort((a, b) => b.teams.length - a.teams.length);
        break;
    }
    setOrganizations(sorted);
  }, [sortBy]);

  // Responsive grid classes for different screen sizes
  const gridClasses = {
    desktop: "grid-cols-12",
    tablet: "md:grid-cols-12",
    mobile: "grid-cols-6", // Fewer columns on mobile
  };

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader />
    </div>
  ) : (
    <div className="p-2">
      <div className="flex flex-col items-start justify-between mb-8 sm:flex-row sm:items-center">
        <h1 className="mb-4 text-2xl font-medium sm:mb-0">
          {inititate ? "Select organization" : "Organizations"}{" "}
        </h1>
        <div className="flex items-center gap-4">
          <p>Sort by</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 pr-6 border rounded-md border-Turquoise"
          >
            <option>Most Recent</option>
            <option>Name</option>
            <option>Teams</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Header Row - Hidden on mobile, visible on tablet/desktop */}
        <div
          className={`hidden md:grid ${gridClasses.tablet} px-4 text-sm text-gray-500`}
        >
          <div className="col-span-4">Name</div>
          {/* <div className="col-span-3">Description</div> */}
          <div className="col-span-3">Date Created</div>
          <div className="col-span-3 text-center">Teams</div>
          <div className="col-span-2">Actions</div>
        </div>

        {/* Organization Items */}
        {organizations.map((org) => (
          <div
            key={org.id}
            className={`grid ${gridClasses.mobile} ${
              gridClasses.tablet
            } items-center px-4 py-4 bg-white rounded-lg shadow-sm ${
              inititate ? "cursor-pointer hover:bg-gray-50" : ""
            }`}
            onClick={(e) => handleRowClick(org, e)}
          >
            {/* Mobile view: 2-column layout */}
            <div className="flex flex-col col-span-5 md:hidden">
              <div className="font-medium">{org.name}</div>
              <div className="text-sm text-gray-600">
                {new Date(org.createdAt).toLocaleDateString()} ·{" "}
                {org.teams.length} teams
              </div>
              {/* <div className="mt-1 text-sm text-gray-600 break-words">
                {org.description || "No description..."}
              </div> */}
            </div>

            {/* Mobile view: Actions column */}
            <div className="flex justify-end col-span-1 md:hidden">
              <ActionsMenu org={org} onDelete={handleDelete} />
            </div>

            {/* Desktop view */}
            <div className="hidden col-span-4 font-medium break-words whitespace-normal md:block">
              {org.name}
            </div>
            {/* <div className="hidden col-span-3 text-gray-600 break-words whitespace-normal md:block">
              {org.description || "No description..."}
            </div> */}
            <div className="hidden col-span-3 md:block">
              {new Date(org.createdAt).toLocaleDateString()}
            </div>
            <div className="hidden col-span-3 text-center md:block">
              {org.teams.length}
            </div>

            {/* Desktop view: Actions */}
            <div className="hidden col-span-2 md:flex md:gap-2">
              <Link
                to={`/organizations/manage/${org.id}`}
                className="p-2 rounded hover:bg-gray-100"
              >
                <Edit />
              </Link>
              <button
                onClick={() => handleDelete(org)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <Trash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageOrganization;
