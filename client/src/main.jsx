import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { StrictMode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

const client_id ="751976998183-2hkn04gfldc6jg1i1bpvhehtclmrkglg.apps.googleusercontent.com"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={client_id}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode> 
);
