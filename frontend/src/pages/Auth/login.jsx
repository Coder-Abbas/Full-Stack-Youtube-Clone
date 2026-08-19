import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";

import useAuthStore from "./../../store/authStore";
import toast from "react-hot-toast";


const Login = () => {

  const navigate = useNavigate();

  const {
    login,
    isLoggingIn,
    error,
  } = useAuthStore();


  const [showPassword, setShowPassword] =
    useState(false);


  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });


  // ==========================================
  // Input
  // ==========================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // ==========================================
  // Submit
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    const result =
      await login(formData);


    if (result.success) {

      navigate("/");
      toast.success("Logged in successfully!");

    }

  };


  return (

    <div
      className="
                min-h-screen
                bg-gray-50
                flex
                items-center
                justify-center
                px-4
            "
    >

      <div
        className="
                    w-full
                    max-w-md
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    border-gray-200
                    p-8
                "
      >

        {/* Logo */}

        <div className="text-center mb-8">

          <img
            src="/images.png"
            alt="Logo"
            className="
                            w-32
                            mx-auto
                            mb-5
                            cursor-pointer
                        "
            onClick={() =>
              navigate("/")
            }
          />

          <h1
            className="
                            text-2xl
                            font-bold
                            text-gray-900
                        "
          >
            Welcome back
          </h1>

          <p
            className="
                            text-sm
                            text-gray-500
                            mt-2
                        "
          >
            Login to continue
          </p>

        </div>


        {/* Error */}

        {error && (

          <div
            className="
                            bg-red-50
                            border
                            border-red-200
                            text-red-600
                            text-sm
                            p-3
                            rounded-lg
                            mb-5
                        "
          >
            {error}
          </div>

        )}


        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email or Username */}

          <div>

            <label
              className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-1
                            "
            >
              Email or username
            </label>

            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="you@example.com or username"
              required
              className="
                                w-full
                                px-4
                                py-3
                                border
                                border-gray-300
                                rounded-xl
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                            "
            />

          </div>


          {/* Password */}

          <div>

            <div
              className="
                                flex
                                justify-between
                                items-center
                                mb-1
                            "
            >

              <label
                className="
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="
                                    text-sm
                                    text-blue-600
                                    hover:underline
                                "
              >
                Forgot password?
              </Link>

            </div>


            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="
                                    w-full
                                    px-4
                                    py-3
                                    pr-12
                                    border
                                    border-gray-300
                                    rounded-xl
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                className="
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-500
                                    hover:text-gray-900
                                    cursor-pointer
                                "
              >

                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}

              </button>

            </div>

          </div>


          {/* Login */}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            py-3
                            bg-blue-600
                            text-white
                            font-semibold
                            rounded-xl
                            cursor-pointer
                            hover:bg-blue-700
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                            transition
                        "
          >

            <LogIn size={19} />

            {isLoggingIn
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        {/* Register */}

        <p
          className="
                        text-center
                        text-sm
                        text-gray-600
                        mt-6
                    "
        >

          Don't have an account?

          {" "}

          <Link
            to="/register"
            className="
                            text-blue-600
                            font-medium
                            hover:underline
                        "
          >
            Create account
          </Link>

        </p>

      </div>

    </div>
  );
};


export default Login;