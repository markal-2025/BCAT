import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import api from "../../../../utils/api";

/**
 * UserPromisesResults component displays the details of a specific promise result
 * that the user has made in the past.
 *
 * It shows:
 * - The promise text
 * - When it was created
 * - The acceptance status
 * - The team it was made for
 */
const UserPromisesResults = () => {
  const { promiseResultId } = useParams();
  const [loading, setLoading] = useState(true);
  const [promiseResult, setPromiseResult] = useState<any>(null);
  console.log(promiseResultId);
  useEffect(() => {
    const fetchPromiseResult = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/api/v1/survey/getUserPromiseResponse?promiseSessionId=${promiseResultId}`
        );
        console.log(data);
        setPromiseResult(data[0]);
      } catch (error) {
        console.error("Failed to fetch promise result:", error);
      } finally {
        setLoading(false);
      }
    };

    if (promiseResultId) {
      fetchPromiseResult();
    }
  }, [promiseResultId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <ClipLoader color="#4F46E5" size={40} />
      </div>
    );
  }

  if (!promiseResult) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-medium text-gray-700">Promise not found</h2>
        <p className="mt-2 text-gray-500">
          The promise result you're looking for could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex flex-col items-start justify-between mt-8 mb-8 sm:flex-row sm:items-center">
        <h1 className="mb-4 text-2xl font-medium sm:mb-0">
          Promise for {promiseResult.promiseSession.team.name}
        </h1>
      </div>

      {/* Promise Details Card */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-medium">My Promise</h2>
        <p className="p-4 mb-4 text-gray-700 rounded-md bg-gray-50">
          {promiseResult.myPromise}
        </p>

        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Date Created
            </h3>
            <p className="text-gray-700">
              {new Date(promiseResult.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-1 text-sm font-medium text-gray-500">Team</h3>
            <p className="text-gray-700">
              {promiseResult.promiseSession.team.name}
            </p>
          </div>

          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-1 text-sm font-medium text-gray-500">Status</h3>
            <p
              className={`font-medium ${
                promiseResult.isAccepted ? "text-green-700" : "text-red-700"
              }`}
            >
              {promiseResult.isAccepted ? "Accepted" : "Not Accepted"}
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines Section */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-4 text-xl font-medium">Promise Guidelines</h2>
        <div className="p-4 whitespace-pre-line rounded-md bg-gray-50">
          {promiseResult.promiseSession.promise.guideLines}
        </div>
      </div>
    </div>
  );
};

export default UserPromisesResults;
