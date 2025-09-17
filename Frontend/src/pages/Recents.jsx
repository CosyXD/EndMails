import { useState, useRef, useEffect, use } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import loadingEmails from "../assets/icons/VSlo7mYp9O.gif";

const Recents = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();
  const { googleConnected } = user.publicMetadata;

  useEffect(() => {
    fetchRecents();
  }, []);

  async function fetchRecents() {
    const response = await fetch(
      `http://localhost:3000/gmail/recents?userId=${user.id}`,
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
      const googleAuthUrl = `http://localhost:3000/oauth/connect?state=${encodeURIComponent(
        user.id
      )}`;
      window.location.href = googleAuthUrl;
    }
    setMessages(Array.isArray(messages) ? messages : []);
  }

  async function replyRecent(message) {
    const response = await fetch("http://localhost:3000/gmail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        to: message.email,
        subject: "Re: " + message.id,
        text: "Your reply here",
        userId: user.id,
      }),
    });
    if (response.ok) {
      console.log("Reply sent successfully");
    } else {
      console.log("Failed to send reply");
    }
  }

  async function handleReply(message) {
    navigate("/compose", { state: { email: message } });
  }

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
            End Some Recents:
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
                  handleReply(message);
                }}
              >
                <div className="content-sender">
                  <h2>{message.sender}</h2>
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
          Please connect your Google account to view recent messages.
        </h1>
      )}
    </>
  );
};

export default Recents;
