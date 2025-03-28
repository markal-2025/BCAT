/**
 * ResetPassword.tsx
 *
 * This component handles the password reset functionality when a user follows
 * a reset link from their email. It validates the new password, confirms it matches,
 * and submits the request to the server using the token from the URL.
 *
 * Key features:
 * - Validates token from URL parameters
 * - Ensures password and confirmation match
 * - Provides real-time validation feedback
 * - Handles API communication for password reset
 * - Shows loading state during submission
 * - Redirects to login on success
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../imgs/BCAT_Logo_Final.svg";
import api from "../../../utils/api";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

/**
 * ResetPassword component for handling the password reset flow
 *
 * Uses the token from URL parameters to authenticate the reset request
 * and allows users to set a new password after validation.
 */
const ResetPassword = () => {
  const { token } = useParams(); // Get reset token from URL
  const [password, setPassword] = useState(""); // New password
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirmation password
  const [passwordsMatch, setPasswordsMatch] = useState(true); // Password matching state
  const [loading, setloading] = useState(false); // Loading state during submission
  const navigate = useNavigate();

  /**
   * Handles form submission for password reset
   *
   * Validates passwords match, then submits the reset request to the API
   * with the token and new password. On success, redirects to login.
   *
   * @param e - Form submission event
   */
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    setPasswordsMatch(true);
    try {
      setloading(true);
      await api.post("/api/v1/auth/reset", {
        newPassword: password,
        token,
      });
      toast.success("Password reset successfully.");
      navigate("/login");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setloading(false);
    }
  };

  /**
   * Handles changes to the password field
   *
   * Updates password state and validates match with confirmation
   * if confirmation has been entered.
   *
   * @param e - Input change event
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (confirmPassword) {
      setPasswordsMatch(e.target.value === confirmPassword);
    }
  };

  /**
   * Handles changes to the confirm password field
   *
   * Updates confirmation state and validates match with password
   *
   * @param e - Input change event
   */
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(e.target.value === password);
  };

  return (
    <div className="p-12">
      <form onSubmit={handleFormSubmit} className="max-w-xl mx-auto">
        <img src={logo} alt="" />
        <h1 className="my-4 text-3xl font-medium text-center">
          Reset Password
        </h1>
        {/* Password input with conditional styling based on validation */}
        <input
          name="password"
          type="password"
          placeholder="New password"
          value={password}
          onChange={handlePasswordChange}
          className={`block w-full p-2 mb-4 border ${
            passwordsMatch ? "border-gray-300" : "border-red-500"
          } rounded-md transition-all duration-300`}
        />
        {/* Confirm password input with conditional styling */}
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          className={`block w-full p-2 mb-4 border ${
            passwordsMatch ? "border-gray-300" : "border-red-500"
          } rounded-md transition-all duration-300`}
        />
        {/* Error message shown when passwords don't match */}
        {!passwordsMatch && (
          <p className="mb-4 text-red-500 transition-all duration-300">
            Passwords do not match.
          </p>
        )}
        {/* Submit button with loading state */}
        <button
          type="submit"
          className="flex items-center justify-center w-full px-4 py-2 font-normal text-white rounded-full bg-Turquoise"
        >
          {loading ? <ClipLoader size={25} color="white" /> : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
