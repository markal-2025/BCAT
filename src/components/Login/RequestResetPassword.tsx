import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { Box } from "@mui/material";
import Logo from "../../imgs/BCAT_Logo_Final.svg";
import Email from "../../icons/Email";
import api from "../../../utils/api";

const RequestResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/v1/auth/sendResetEmail", { email });
      toast.success(
        "If an account exists with this email, you will receive a password reset link shortly."
      );
    } catch (error: any) {
      console.error(error);
      if (error.status !== 404) {
        toast.error("Something went wrong. Please try again later.");
      } else {
        toast.success(
          "If an account exists with this email, you will receive a password reset link shortly."
        );
      }
    } finally {
      setLoading(false);
    }
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

        {/* Right panel with reset password form */}
        <Box className="md:w-2/3 w-full bg-[#fcfbf7] flex flex-col md:h-full h-2/3 justify-center items-center p-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center w-full h-full gap-8 p-2 md:p-12 md:w-2/3"
          >
            <h1 className="text-2xl text-Turquoise">Reset Password</h1>
            <p className="text-center text-gray-600">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            {/* Email Input with Icon */}
            <div className="relative w-full">
              <div className="absolute text-gray-500 transform -translate-y-1/2 top-2/4 left-3">
                <Email />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 pl-10 border rounded-lg"
                required
              />
            </div>

            {/* Send Reset Link button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-1 font-normal text-white rounded-full bg-Turquoise"
            >
              {loading ? (
                <ClipLoader size={25} color="white" />
              ) : (
                "Send Reset Link"
              )}
            </button>

            <a href="/login" className="text-sm text-Turquoise hover:underline">
              Back to Login
            </a>
          </form>
        </Box>
      </div>
    </div>
  );
};

export default RequestResetPassword;
