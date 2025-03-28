import { useParams } from "react-router-dom";
import { PromiseType, useAuth } from "../../../../contexts/Auth";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import api from "../../../../../utils/api";

const PromisesResults = () => {
  const { getOrganization, fetchedOrg } = useAuth();
  const [promiseSessionResults, setPromiseSessionResults] = useState<
    PromiseType[]
  >([]);
  const { organizationId, promiseId } = useParams();
  useEffect(() => {
    if (organizationId) {
      getOrganization(Number(organizationId));
      const getPromiseSessionResults = async () => {
        const { data } = await api.get(
          `/api/v1/survey/getPromiseSessionResults?promiseSessionId=${promiseId}`
        );
        setPromiseSessionResults(data);
      };
      getPromiseSessionResults();
    }
  }, [organizationId]);

  // Responsive grid classes for different screen sizes
  const gridClasses = {
    desktop: "grid-cols-12",
    tablet: "md:grid-cols-12",
    mobile: "grid-cols-6", // Fewer columns on mobile
  };
  return fetchedOrg ? (
    <div className="p-2">
      <div className="flex flex-col items-start justify-between mt-8 mb-8 sm:flex-row sm:items-center">
        <h1 className="mb-4 text-2xl font-medium sm:mb-0">All Promises</h1>
      </div>

      <div className="grid gap-4">
        {/* Header Row - Hidden on mobile, visible on tablet/desktop */}
        <div
          className={`hidden md:grid ${gridClasses.tablet} px-4 text-sm text-gray-500`}
        >
          <div className="col-span-2">Name</div>
          <div className="col-span-6">Promise Description</div>
          <div className="col-span-2">Date Created</div>
          <div className="col-span-2 text-center">Status</div>
        </div>

        {promiseSessionResults.map((promise) => (
          <div
            key={promise.id}
            className={`grid ${gridClasses.mobile} ${gridClasses.tablet} items-center px-4 py-4 bg-white rounded-lg shadow-sm`}
          >
            {/* Mobile view: 2-column layout */}
            <div className="flex flex-col col-span-5 md:hidden">
              <div className="font-medium">{promise.user.username}</div>
              <div className="text-sm text-gray-600">
                {new Date(promise.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-1 text-sm text-gray-600 break-words">
                {promise.myPromise}
              </div>
            </div>

            {/* Mobile view: Actions column */}
            <div className="flex justify-end col-span-1 md:hidden">
              Completed
            </div>

            {/* Desktop view */}
            <div className="hidden col-span-2 font-medium break-words whitespace-normal md:block">
              {promise.user.username}
            </div>
            <div className="hidden col-span-6 text-gray-600 break-words whitespace-normal md:block">
              {promise.myPromise}
            </div>
            <div className="hidden col-span-2 md:block">
              {new Date(promise.createdAt).toLocaleDateString()}
            </div>
            <div
              className={`hidden col-span-2 text-center md:block ${
                promise.isAccepted
                  ? "text-green-800 bg-green-100"
                  : "text-red-800 bg-red-100"
              }`}
            >
              {promise.isAccepted ? "Accepted" : "Rejected"}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-[200px]">
      <ClipLoader color="#4F46E5" size={40} />
    </div>
  );
};

export default PromisesResults;
