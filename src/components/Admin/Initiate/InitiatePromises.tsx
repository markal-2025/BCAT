import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/Auth";
import { useEffect } from "react";
const InitiatePromises = () => {
  const { setCurrenOrganization } = useAuth();
  useEffect(() => {
    setCurrenOrganization(null);
  }, []);
  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-medium text-gray-500">
        Initiate Promise/Survey Session
      </h1>
      <p className="w-1/2 mb-4 font-medium">
        Start a new assessment session to measure your team's brand and culture
        alignment. Our comprehensive analysis helps identify gaps between
        perceived and desired organizational culture, enabling teams to build
        stronger, more aligned workplaces through actionable insights and
        targeted improvements.
      </p>

      <h2 className="my-1 font-medium text-black">Promise session</h2>
      <ul className="ml-8 list-disc">
        <li>Define your team's cultural aspirations and brand values</li>
        <li>Set measurable goals for cultural transformation</li>
        <li>Track progress towards desired organizational behaviors</li>
      </ul>
      <h2 className="my-1 font-medium text-black">Survey session</h2>
      <ul className="ml-8 list-disc">
        <li>Assess current team perceptions of brand and culture</li>
        <li>Identify alignment gaps across different organizational levels</li>
        <li>Gather insights for data-driven cultural development</li>
      </ul>
      <div className="flex items-center justify-end w-full">
        <Link
          to={"/initiate/organizations"}
          className="btn-primary !w-fit hover:bg-white hover:text-Turquoise hover:border-Turquoise border transition-all"
        >
          Initiate Promise / Survey Session
        </Link>
      </div>
    </div>
  );
};

export default InitiatePromises;
