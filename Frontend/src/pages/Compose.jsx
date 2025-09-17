import { useRef, useState } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { useLocation, useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";

const Compose = () => {
  let email = useLocation().state?.email || {};

  const { user } = useUser();
  const genReplyTRef = useRef(null);
  const recipientEmailRef = useRef(null);
  const recipientNameRef = useRef(null);
  const navigate = useNavigate();

  async function getGeneratedReply() {
    const genBox = genReplyTRef.current;
    if (!genReplyTRef.current.value) {
      genBox.value = "Where's my prompt?";
      return;
    }
    const generatedReply = await fetch(`${BACKEND_URL}/gemini/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.content,
        prompt: genBox.value,
        userName: user.fullName,
        recipientName: email.sender,
      }),
    });

    const reply = await generatedReply.json();
    genBox.value = reply.text;
    console.log(reply.text);
  }

  async function getGeneratedMail() {
    const genBox = genReplyTRef.current;
    if (!genReplyTRef.current.value) {
      genBox.value = "Where's my prompt?";
      return;
    }
    const generatedMail = await fetch(`${BACKEND_URL}/gemini/generate-new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: genBox.value,
        userName: user.fullName,
        recipientName: recipientNameRef.current.value,
      }),
    });

    const mail = await generatedMail.json();
    genBox.value = mail.text;
    console.log(mail.text);
  }

  async function sendMail() {
    const genBox = genReplyTRef.current;
    if (!email.email) {
      if (!recipientNameRef.current.value || !recipientEmailRef.current.value) {
        genBox.value = "Please enter recipient name and email!";
        return;
      }
    }
    if (!email.email) {
      email.email = recipientEmailRef.current.value;
      email.sender = recipientNameRef.current.value;
      email.id = Math.floor(Math.random() * 1000);
    }
    if (!genBox.value) {
      genBox.value = "No reply to send! Generate one first.";
      return;
    }
    const response = await fetch(`${BACKEND_URL}/gmail/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email.email,
        subject: "Re: " + email.id,
        text: genBox.value,
        userId: user.id,
      }),
    });
    const result = await response.json();
    console.log(result);

    if (response.ok) {
      navigate("/");
    } else {
      genBox.value = "Failed to send mail. Try again.";
    }
  }

  return (
    <div className="compose-cont">
      <h1>Compose Email</h1>
      <p className="sender">
        To:{" "}
        {email?.sender || (
          <input
            type="email"
            placeholder="Enter recipient email"
            ref={recipientEmailRef}
            className="email-input"
          />
        )}
      </p>
      <p className="email">
        {email?.email || (
          <input
            type="text"
            placeholder="Enter recipient name"
            ref={recipientNameRef}
            className="sender-input"
          />
        )}
      </p>
      <div className="textarea-cont">
        {email?.content && (
          <textarea
            name="emailBody"
            id="emailBody"
            value={email.content}
            readOnly
          ></textarea>
        )}
        <textarea
          name="generatedReply"
          id="generatedReply"
          placeholder={"Generated reply prompt here"}
          ref={genReplyTRef}
        ></textarea>
      </div>
      <div className="buttons-cont">
        <button
          id="genReply"
          className="send-btn"
          onClick={() => {
            if (email && (email.email || email.content)) {
              getGeneratedReply();
            } else {
              getGeneratedMail();
            }
          }}
        >
          Generate Reply
        </button>
        <button
          id="sendReply"
          className="send-btn"
          onClick={() => {
            sendMail();
          }}
        >
          Send Reply
        </button>
      </div>
    </div>
  );
};

export default Compose;
