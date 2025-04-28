/**
 * Login.tsx
 *
 * This component renders the main login page for the application. It provides
 * a clean, branded interface for user authentication with email and password,
 * integrating with the Auth context for login functionality.
 *
 * Key features:
 * - Displays BCAT branding and logo
 * - Provides email and password input fields with icon indicators
 * - Handles form submission for authentication
 * - Shows loading state during authentication
 * - Responsive design for both mobile and desktop views
 */

import React, { useState } from "react";
import { useAuth } from "../../contexts/Auth";
import { ClipLoader } from "react-spinners";
import Logo from "../../imgs/BCAT_Logo_Final.svg";
import { Box } from "@mui/material";
import Email from "../../icons/Email";
import Password from "../../icons/Passwrod";
import { Link } from "react-router-dom";

/**
 * Login component for user authentication
 *
 * Handles user login using the Auth context's login function
 * and manages loading state during authentication
 */
const Login = () => {
  const { login } = useAuth(); // Get login function from Auth context
  const [loading, setLoading] = useState(false); // Track loading state during authentication

  /**
   * Handles form submission for login
   *
   * Collects form data, calls the login function from Auth context,
   * and manages loading state during the process
   *
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await login(
      formData.get("email") as string,
      formData.get("password") as string
    );
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center h-screen p-0 md:p-6">
      <div className="flex flex-col justify-center h-full md:flex-row">
        {/* Left panel with branding and logo */}
        <Box className="p-4 bg-[#f0f8fa] md:w-1/3 w-full md:h-full h-[40%] flex flex-col gap-12 items-center">
          <img src={Logo} height={"250px"} alt="" />
          <div className="mt-12">
            <h1 className="text-3xl font-bold text-Turquoise">
              Brand and Culture Alignment Toolkit&reg;
            </h1>
          </div>
        </Box>

        {/* Right panel with login form */}
        <Box className="md:w-2/3 w-full bg-[#fcfbf7] flex flex-col md:h-full h-2/3 justify-center items-center p-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center w-full h-full gap-8 p-2 md:p-12 md:w-2/3"
          >
            <h1 className="text-2xl text-Turquoise">Log in</h1>

            {/* Email Input with Icon */}
            <div className="relative w-full">
              <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                <Email />
              </div>
              <input
                type="text"
                name="email"
                placeholder="Email"
                className="w-full p-2 pl-10 border rounded-lg"
              />
            </div>

            {/* Password Input with Icon */}
            <div className="relative w-full">
              <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                <Password />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-2 pl-10 border rounded-lg"
              />
            </div>

            {/* Login button with loading state */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-1 font-normal text-white rounded-full bg-Turquoise"
            >
              {loading ? <ClipLoader size={25} color="white" /> : "Login"}
            </button>
            <Link
              to={"/reset-password"}
              className="text-sm text-Turquoise hover:underline"
            >
              Forgot your password?
            </Link>
          </form>
        </Box>
      </div>
    </div>
  );
};

export default Login;
