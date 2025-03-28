import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useSurvey } from "../../../contexts/Survey";
import { useAuth } from "../../../contexts/Auth";

const TeamPromises = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { promisesResults, fetchPromisesResults } = useSurvey();
  const { myTeams } = useAuth();

  // Find the current team from myTeams
  const currentTeam = myTeams.find((team) => team.teams.id === Number(teamId));

  // Filter promises for this team
  const teamPromises = promisesResults?.filter(
    (promise) => promise.promiseSession.teamId === Number(teamId)
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Make sure we have the promises data
        await fetchPromisesResults();
      } catch (error) {
        console.error("Error fetching promise results:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Responsive grid classes for different screen sizes
  const gridClasses = {
    desktop: "grid-cols-12",
    tablet: "md:grid-cols-12",
    mobile: "grid-cols-6", // Fewer columns on mobile
  };

  const handleViewPromises = (promiseSessionId: number) => {
    navigate(`/promise-results/${promiseSessionId}`);
  };

  if (!currentTeam) {
    return (
      <div className="p-4 text-center text-gray-500">
        Team not found or you don't have access to this team.
      </div>
    );
  }

  return loading ? (
    <div className="flex items-center justify-center h-[200px]">
      <ClipLoader color="#4F46E5" size={40} />
    </div>
  ) : (
    <div className="p-2">
      <div className="flex flex-col items-start justify-between mt-8 mb-8 sm:flex-row sm:items-center">
        <h1 className="mb-4 text-2xl font-medium sm:mb-0">
          {currentTeam.teams.name} Promise Sessions
        </h1>
        <div className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md">
          {currentTeam.organizations.name}
        </div>
      </div>

      {currentTeam.teams.teamDescription && (
        <div className="p-4 mb-6 rounded-md bg-gray-50">
          <h3 className="mb-2 font-medium">Team Description:</h3>
          <p>{currentTeam.teams.teamDescription}</p>
        </div>
      )}

      <div className="grid gap-4">
        {/* Header Row - Hidden on mobile, visible on tablet/desktop */}
        <div
          className={`hidden md:grid ${gridClasses.tablet} px-4 text-sm text-gray-500`}
        >
          <div className="col-span-1">ID</div>
          <div className="col-span-3">Session Date</div>
          <div className="col-span-3">My Promise</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-center">Actions</div>
        </div>

        {teamPromises && teamPromises.length > 0 ? (
          teamPromises.map((promiseResult, index) => {
            const promise = promiseResult.promiseSession;
            return (
              <div
                key={promise.id}
                className={`grid ${gridClasses.mobile} ${gridClasses.tablet} items-center px-4 py-4 bg-white rounded-lg shadow-sm`}
              >
                {/* Mobile view: 2-column layout */}
                <div className="flex flex-col col-span-5 md:hidden">
                  <div className="font-medium">
                    <span className="mr-2 text-gray-500">#{index + 1}</span>
                    {new Date(promise.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {promiseResult.myPromise.substring(0, 40)}...
                  </div>
                  <div className="mt-1 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        promise.isCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {promise.isCompleted ? "Completed" : "In Progress"}
                    </span>
                  </div>
                </div>

                {/* Mobile view: Actions column */}
                <div className="flex justify-end col-span-1 md:hidden">
                  <button
                    onClick={() => handleViewPromises(promise.id)}
                    className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                </div>

                {/* Desktop view */}
                <div className="hidden col-span-1 font-medium md:block">
                  #{index + 1}
                </div>
                <div className="hidden col-span-3 md:block">
                  {new Date(promise.createdAt).toLocaleDateString()}
                </div>
                <div className="hidden col-span-3 overflow-hidden text-gray-600 md:block text-ellipsis">
                  {promiseResult.myPromise.substring(0, 50)}
                  {promiseResult.myPromise.length > 50 ? "..." : ""}
                </div>
                <div className="hidden col-span-2 md:block">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      promise.isCompleted
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {promise.isCompleted ? "Completed" : "In Progress"}
                  </span>
                </div>
                <div className="hidden col-span-3 text-center md:block">
                  <button
                    onClick={() => handleViewPromises(promise.id)}
                    className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    View Promise
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            No promise sessions found for this team.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPromises;
