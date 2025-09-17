import { useLocation } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const Email = () => {
  const email = useLocation().state?.email || {};
  const { user } = useUser();

  return (
    <div className="email">
      <div className="email-cont">
        <h1>From: {user.fullName} (You)</h1>
        <h2>{email.email}</h2>
        <p style={{ whiteSpace: "pre-line" }}>{email.content}</p>
      </div>
    </div>
  );
};

export default Email;
