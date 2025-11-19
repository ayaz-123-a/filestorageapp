import { GoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginWithGoogle } from "../apis/loginWithGoogle";

function Register() {
    // const [isSignUp, setIsSignUp] = useState(false);
    const navigate=useNavigate();
  const BASE_URL = "http://localhost:4000";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
    //   setIsSignUp(true)

      if (response.ok) {
        toast.success("User created successfully!");
        setFormData({ name: "", email: "", password: "" });
          setTimeout(()=>{
            navigate("/user/login")
        },950)
      } else {
        toast.error(data.message || "Failed to create user");
      }
      if(response.status === 409) {
        toast.error(data.message || "User already exists");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
        >
          Sign Up
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Already registered?{" "}
          <Link to={"/user/login"} className="text-blue-500 hover:underline cursor-pointer">
            Login
          </Link>
        </p>
            <div className="flex items-center my-4">
    <div className="flex-grow h-px bg-gray-300"></div>
    <span className="px-3 text-gray-500 text-sm">or</span>
    <div className="flex-grow h-px bg-gray-300"></div>
  </div>

  {/* Placeholder for Google login button */}

<GoogleLogin
  onSuccess={credentialResponse => {
   const data= loginWithGoogle(credentialResponse.credential)
    if(data.error){
    console.log(data);
    return
  }
  // navigate('/')
  }}
  shape="pill"
  theme="filled_black"
  text="continue_with"
  onError={() => {
    console.log('Login Failed');
  }}
  useOneTap
   
/>
      </form>
    

      {/* Toastify container */}
      <ToastContainer position="bottom-center" autoClose={800} />
    </div>
  );
}

export default Register;
