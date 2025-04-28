import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import api from "../../../../utils/api";

interface UserDetails {
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * UserPromisesResults component displays the details of a specific promise result
 * that the user has made in the past.
 *
 * It shows:
 * - The promise text
 * - When it was created
 * - The acceptance status
 * - The team it was made for
 * - User details (editable)
 */
const UserPromisesResults = () => {
  const { promiseResultId } = useParams();
  const [loading, setLoading] = useState(true);
  const [promiseResult, setPromiseResult] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    email: "",
    firstName: "",
    lastName: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPromiseResult = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(
          `/api/v1/survey/getUserPromiseResponse?promiseSessionId=${promiseResultId}`
        );
        setPromiseResult(data[0]);
        setUserDetails({
          email: data[0].email,
          firstName: data[0].firstName,
          lastName: data[0].lastName,
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/api/v1/survey/updateUserPromiseResponse`, {
        ...userDetails,
        promiseId: promiseResultId,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user details:", error);
    } finally {
      setIsSaving(false);
    }
  };

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

      {/* User Details Card */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Accountability Partner </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center gap-2 ${
                isSaving
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSaving ? (
                <>
                  <ClipLoader color="#ffffff" size={16} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              First Name
            </h3>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={userDetails.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="text-gray-700">{userDetails.firstName}</p>
            )}
          </div>

          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-1 text-sm font-medium text-gray-500">
              Last Name
            </h3>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={userDetails.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="text-gray-700">{userDetails.lastName}</p>
            )}
          </div>

          <div className="p-4 rounded-md bg-gray-50">
            <h3 className="mb-1 text-sm font-medium text-gray-500">Email</h3>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            ) : (
              <p className="text-gray-700">{userDetails.email}</p>
            )}
          </div>
        </div>
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
