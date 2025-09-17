import writeLogo from "../assets/icons/Edit_fill.svg";
import archiveLogo from "../assets/icons/Arhive_fill.svg";
import messageLogo from "../assets/icons/Message_fill.svg";
import bookLogo from "../assets/icons/Book_open_fill.svg";
import { useUser } from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "react-router";
import { use, useRef, useState } from "react";

const Sidebar = () => {
  const { user } = useUser();
  const { googleConnected, geminiConnected } = user.publicMetadata;
  const [visibleInput, setVisibleInput] = useState(false);
  const gemInput = useRef(null);
  const navigate = useNavigate();
  const path = useLocation().pathname;

  return (
    <div className="sidebar">
      <div className="sidebar-cont">
        <button
          className="end-btn"
          onClick={() => {
            navigate("/compose");
          }}
        >
          <p className="btn-text">End Another</p>
          <img src={writeLogo} alt="" className="edit-ico" />
        </button>
        <Link to="/" className={`nav-recents ${path === "/" ? "active" : ""}`}>
          <img src={archiveLogo} alt="" />
          <p>Recents</p>
        </Link>
        <Link
          to="/replies"
          className={`nav-replies ${path === "/replies" ? "active" : ""}`}
        >
          <img src={messageLogo} alt="" />
          <p>Replies</p>
        </Link>
        <Link
          to="/ask"
          className={`nav-ask ${path === "/ask" ? "active" : ""}`}
        >
          <img src={bookLogo} alt="" />
          <p>Ask the Mail</p>
        </Link>
        {!googleConnected && (
          <button
            className="connect-btn"
            onClick={async () => {
              const googleAuthUrl = `http://localhost:3000/oauth/connect?state=${encodeURIComponent(
                user.id
              )}`;
              window.location.href = googleAuthUrl;
            }}
            style={{ cursor: "pointer", padding: "1.2rem" }}
          >
            <img src={archiveLogo} alt="" />
            <p className="btn-text">Connect Mail</p>
          </button>
        )}
        {!geminiConnected && (
          <button
            className="connect-btn"
            onClick={() => {
              setVisibleInput(true);
            }}
            style={{ cursor: "pointer", padding: "1.2rem" }}
          >
            <img src={bookLogo} alt="" />
            <p className="btn-text">Connect Gemini</p>
          </button>
        )}
        {visibleInput && (
          <div>
            <input
              type="text"
              name="gemini-api"
              id="gemini-api"
              ref={gemInput}
            />
            <button
              onClick={async () => {
                if (!gemInput.current.value) {
                  console.log("No API key provided");
                  return;
                }

                const response = await fetch(
                  "http://localhost:3000/gemini/connect",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      apiKey: gemInput.current.value,
                      userId: user.id,
                    }),
                  }
                );

                if (response.ok) {
                  console.log("Gemini connected successfully");
                } else {
                  console.log("Failed to connect Gemini");
                }
                setVisibleInput(false);
              }}
              className="end-btn"
            >
              Connect Input
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
