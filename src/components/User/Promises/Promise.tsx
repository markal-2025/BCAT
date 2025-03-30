/**
 * Promise.tsx
 *
 * This component renders the promise submission form for users, allowing them
 * to submit promises of personal alignment based on guidelines. It handles
 * the entire lifecycle of promise submission, including validation and feedback.
 *
 * Key features:
 * - Fetches promise guidelines based on promiseId
 * - Provides form for promise submission with multiple fields
 * - Handles server-side validation with instructions for improvement
 * - Provides loading states during data fetching and form submission
 * - Shows success/error notifications for user feedback
 */

import { TextareaAutosize } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../utils/api";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

/**
 * Interface for the promise data structure
 */
interface PromiseType {
  promise: {
    id: number;
    guideLines: string;
  };
  team: {
    id: number;
    name: string;
  };
}

/**
 * Promise component that handles the promise submission workflow
 *
 * The component has three main states:
 * 1. Loading state - While fetching the promise data
 * 2. Error state - When a submitted promise needs revision
 * 3. Form state - The promise submission form
 */
const Promise = () => {
  const { promiseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [promiseData, setPromiseData] = useState<PromiseType>();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [promiseError, setPromiseError] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const navigate = useNavigate();

  /**
   * Effect to fetch promise data when the component mounts
   * or when the promiseId changes
   */
  useEffect(() => {
    const fetchPromise = async () => {
      if (!loading) setLoading(true);
      try {
        const res = await api.get(
          `/api/v1/survey/checkPromise?promiseId=${promiseId}`
        );
        setPromiseData(res.data);
      } catch (error) {
        navigate("/"); // Redirect on error
      } finally {
        setLoading(false);
      }
    };
    fetchPromise();
  }, [promiseId]);

  /**
   * Handles form submission for the promise
   *
   * The function:
   * 1. Prevents default form submission
   * 2. Collects form data and prepares it for the API
   * 3. Submits the data with loading indicator and toast notifications
   * 4. Handles the response - either showing revision instructions or success message
   */
  const handlePromiseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const requestData = {
      ...Object.fromEntries(formData.entries()),
      responses: {
        myPromise: formData.get("myPromise"),
        difference: formData.get("difference"),
      },
      promiseId,
    };
    try {
      setButtonLoading(true);
      const res = await toast.promise(
        api.post("/api/v1/survey/submitPromise", requestData),
        {
          pending: "Submitting your promise please don't close the window.",
          error: "Failed to submit promise. Please try again.",
        }
      );

      // Check if API response contains result: false (indicating revision needed)
      if (res.data.result === false) {
        toast.error(`Submission needs revision`);
        setPromiseError(true);
        setInstructions(res.data.instructions);
      } else {
        setPromiseError(false);
        setInstructions([]);
        toast.success("Promise submitted successfully! 🎉");
        navigate("/");
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  // Render loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <ClipLoader />
      </div>
    );
  }

  // Render error state with revision instructions
  if (promiseError) {
    return (
      <div className="flex flex-col justify-center gap-4 mt-8">
        <h1 className="text-2xl font-medium">
          Instructions to align with your Organization
        </h1>
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className="relative px-4 py-3 bg-gray-200 border-gray-100 rounded"
            role="alert"
          >
            <span className="block sm:inline">{instruction}</span>
          </div>
        ))}
        <button
          className="btn-primary !w-fit "
          onClick={() => {
            setPromiseError(false);
            setInstructions([]);
          }}
        >
          Re-submit your promise
        </button>
      </div>
    );
  }

  // Render the promise submission form
  return (
    <div>
      <form action="" onSubmit={handlePromiseSubmit}>
        {/* Guidelines section - Read-only from promiseData */}
        <div className="mt-4">
          <label htmlFor="">Guidelines:</label>
          <TextareaAutosize
            name="guideLines"
            id=""
            required
            disabled
            defaultValue={promiseData?.promise.guideLines}
            minRows={4}
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 mb-4 border-gray-300"
          ></TextareaAutosize>

          {/* My Promise section - User input */}
          <label htmlFor="">My Promise of Personal Alignment</label>
          <TextareaAutosize
            name="myPromise"
            id=""
            required
            placeholder="The contribution I promise to make:"
            minRows={4}
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          ></TextareaAutosize>
        </div>

        {/* Difference section - User input */}
        <div className="mt-4">
          <label htmlFor="">The Difference Keeping My Promise Will Make</label>
          <TextareaAutosize
            name="difference"
            id=""
            required
            placeholder="The contribution I promise to make:"
            minRows={4}
            className="px-3 py-1.5 w-full border rounded-lg outline-none mt-1 border-gray-300"
          ></TextareaAutosize>
        </div>

        {/* Trusted people section - Optional fields */}
        <div className="mt-4">
          <label htmlFor="">
            The People I Trust To Help Me Keep My Promise{" "}
          </label>
          <div className="grid items-center w-full grid-cols-1 gap-5 md:grid-cols-2">
            <input
              name="firstName"
              className="px-1 py-1.5 pl-10  border rounded-lg outline-none mt-1 border-gray-300"
              type="text"
              placeholder="First Name"
            />
            <input
              name="lastName"
              className="px-1 py-1 pl-10 mt-1 border border-gray-300 rounded-lg outline-none "
              type="text"
              placeholder="Last Name"
            />
            <input
              name="email"
              className="px-1 py-1.5 pl-10  border rounded-lg outline-none mt-1 border-gray-300"
              type="email"
              placeholder="Email Address"
            />
          </div>
        </div>

        {/* Submit button with loading state */}
        <div className="flex items-center justify-end w-full mt-6">
          <button className="btn-primary ">
            {buttonLoading ? (
              <div className="flex items-center justify-center">
                <ClipLoader color="white" size={25} />
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Promise;
