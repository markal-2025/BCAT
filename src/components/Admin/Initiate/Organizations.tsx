import ManageOrganization from "../Organization/ManageOrganization";
import { useAuth } from "../../../contexts/Auth";
import { useEffect } from "react";
const Organizations = () => {
  const { setCurrenOrganization } = useAuth();
  useEffect(() => {
    setCurrenOrganization(null);
  }, []);
  return (
    <div className="p-12">
      <ManageOrganization inititate />
    </div>
  );
};

export default Organizations;
