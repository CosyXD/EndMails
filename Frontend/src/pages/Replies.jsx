import { useState, useEffect } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useUser } from "@clerk/clerk-react";
import loadingEmails from "../assets/icons/VSlo7mYp9O.gif";
import { useNavigate } from "react-router";

const Replies = () => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();
  const { googleConnected } = user.publicMetadata;
  async function fetchReplies() {
    const response = await fetch(
      `${BACKEND_URL}/gmail/replies?userId=${user.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    const messages = await response.json();
    if (messages.error) {
      console.log("Error fetching replies:", messages.error);
      const googleAuthUrl = `${BACKEND_URL}/oauth/connect?state=${encodeURIComponent(
        user.id
      )}`;
      window.location.href = googleAuthUrl;
    }
    setMessages(Array.isArray(messages) ? messages : []);
  }

  useEffect(() => {
    fetchReplies();
  }, []);

  return (
    <>
      {googleConnected && (
        <div className="recents-cont">
          <h2
            style={{
              padding: "1rem 0 0.5rem 1rem",
              borderBottom: "rgb(71, 71, 71) 1px solid",
              fontWeight: "500",
            }}
          >
            Check Your Replies:
          </h2>
          {messages.length === 0 && (
            <div
              style={{
                height: "80vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              className="loading-cont"
            >
              <img
                src={loadingEmails}
                alt="Loading Emails"
                style={{ width: "10rem", height: "10rem" }}
              />
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className="message-container">
              <div
                className="message"
                onClick={() => {
                  navigate("/email", { state: { email: message } });
                }}
              >
                <div className="content-sender">
                  <h2>{user.firstName} (You)</h2>
                  <p>
                    {message.content.replace(/[=#@!$%^&*()]/g, "").slice(0, 90)}
                    ...
                  </p>
                </div>
                <p className="date">{message.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!googleConnected && (
        <h1 style={{ textAlign: "center", marginTop: "2rem" }}>
          Please connect your Google account to view your replies.
        </h1>
      )}
    </>
  );
};

export default Replies;
