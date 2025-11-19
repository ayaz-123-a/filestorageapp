import { GoogleLogin } from "@react-oauth/google";
import  { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginWithGoogle } from "../apis/loginWithGoogle";

export default function Login() {
  const BASE_URL = "http://localhost:4000";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include", //cookie set akan must aayitt use aakanu
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "user created successfully");
        setFormData({ email: "", password: "" });
        setTimeout(() => {
          navigate("/");
        }, 900);
      } else {
        toast.error(data.message);
      }
      if (response.status === 401) {
        toast.error(data.message || "invalid Credentials");
      }
    } catch (err) {
      toast.error("something went wrong");
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
  <Link to="/user/register" className="text-sm text-blue-600 hover:underline">
    Don't have an account? Sign up
  </Link>

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
  navigate("/")
  }
}
  shape="pill"
  theme="filled_black"
  text="continue_with"
  onError={() => {
    console.log('Login Failed');
  }}
  // useOneTap   
/>
 
</div>

      </div>
      <ToastContainer position="bottom-center" autoClose={800} />
    </div>
  );
}
