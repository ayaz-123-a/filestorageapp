import { useNavigate } from "react-router";

const BASE_URL = "http://localhost:4000";
export const loginWithGoogle = async (idToken) => {
  const response = await fetch(`${BASE_URL}/user/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

