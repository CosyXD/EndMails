import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";

const clerkAPIKey = import.meta.env.VITE_CLERK_API_KEY;

if (!clerkAPIKey) {
  throw new Error("Missing Clerk API Key");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={clerkAPIKey}>
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
