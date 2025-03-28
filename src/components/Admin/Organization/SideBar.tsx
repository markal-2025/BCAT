import { Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import Logo from "../../../imgs/BCAT_Logo_Final.svg";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/Auth";

const SideBar = () => {
  const { user } = useAuth();
  const [openSections, setOpenSections] = useState({
    organizations: false,
    placeholder: false,
  });

  const handleToggle = (section: any) => {
    setOpenSections((prev: any) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  return (
    <>
      <img src={Logo} height={"250px"} alt="" />
      <div className="w-full">
        <h1 className="w-full text-sm ">
          Brand and Culture Alignment Toolkit&reg;
        </h1>
      </div>
      <div className="w-full">
        <List className="flex-grow w-full !font-medium">
          <ListItemButton
            onClick={() => handleToggle("organizations")}
            className="rounded-md hover:bg-gray-100"
          >
            <ListItemText primary="Organizations" />+
          </ListItemButton>

          <Collapse
            in={openSections.organizations}
            timeout="auto"
            unmountOnExit
            className="ml-4"
          >
            <List component="div" disablePadding>
              {user && (
                <ListItemButton className="pl-8 rounded-md hover:bg-gray-100">
                  <Link to={"/organizations/manage"} className="w-full">
                    <ListItemText primary="Manage organizations" />
                  </Link>
                </ListItemButton>
              )}

              <ListItemButton className="pl-8 rounded-md hover:bg-gray-100">
                <Link to={"/organizations/create"} className="w-full">
                  <ListItemText primary="Create a new organization" />
                </Link>
              </ListItemButton>
              {user && (
                <ListItemButton className="pl-8 rounded-md hover:bg-gray-100">
                  <Link to={"/initiate"} className="w-full">
                    <ListItemText primary="Initiate Promise / Survey Session" />
                  </Link>
                </ListItemButton>
              )}
            </List>
          </Collapse>

          {/* <ListItemButton
            onClick={() => handleToggle("placeholder")}
            className="rounded-md hover:bg-gray-100"
          >
            <ListItemText primary="Placeholder" />+
          </ListItemButton> */}

          {/* <Collapse in={openSections.placeholder} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton className="pl-8 rounded-md hover:bg-gray-100">
                <ListItemText primary="Subitem 1" />
              </ListItemButton>
              <ListItemButton className="pl-8 rounded-md hover:bg-gray-100">
                <ListItemText primary="Subitem 2" />
              </ListItemButton>
            </List>
          </Collapse> */}
        </List>
      </div>
    </>
  );
};

export default SideBar;
