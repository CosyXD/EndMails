import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";
import "./App.css";
import Navbar from "./pages/Navbar";
import Sidebar from "./pages/Sidebar";
import { Routes, Route } from "react-router";
import Recents from "./pages/Recents";
import Compose from "./pages/Compose";
import Replies from "./pages/Replies";
import Email from "./pages/Email";
import Profile from "./pages/Profile";
import Ask from "./pages/Ask";

function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route
        path="/"
        element={
          <>
            <SignedIn>
              <Navbar />
              <div className="horizontal-content">
                <Sidebar />
                <Recents />
              </div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />

      <Route
        path="/compose"
        element={
          <>
            <SignedIn>
              <Navbar />
              <Compose />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/replies"
        element={
          <>
            <SignedIn>
              <Navbar />
              <div className="horizontal-content">
                <Sidebar />
                <Replies />
              </div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/email"
        element={
          <>
            <SignedIn>
              <Navbar />
              <div className="horizontal-content">
                <Sidebar />
                <Email />
              </div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/profile"
        element={
          <>
            <SignedIn>
              <Navbar />
              <div className="horizontal-content">
                <Sidebar />
                <Profile />
              </div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/ask"
        element={
          <>
            <SignedIn>
              <Navbar />
              <div className="horizontal-content">
                <Sidebar />
                <Ask />
              </div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
    </Routes>
  );
}

export default App;
