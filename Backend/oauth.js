import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import { createClerkClient } from "@clerk/backend";

dotenv.config();

const oauthRouter = express.Router();
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectURI = process.env.GOOGLE_REDIRECT_URI;

// ----------------------------------------
// Step 1: Redirect user to Google OAuth
// ----------------------------------------
oauthRouter.get("/connect", (req, res) => {
  const userId = req.query.state;
  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID missing" });
  }

  const params = new URLSearchParams({
    client_id: clientID,
    redirect_uri: redirectURI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.modify",
    access_type: "offline",
    prompt: "consent",
    state: userId, // carry Clerk userId through Google OAuth
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log("Redirecting to Google OAuth:", url);

  res.redirect(url); // browser navigates to Google consent screen
});

// ----------------------------------------
// Step 2: Handle Google callback
// ----------------------------------------
oauthRouter.get("/callback", async (req, res) => {
  const code = req.query.code;
  const userId = req.query.state; // comes from the frontend via Google

  if (!code || !userId) {
    return res
      .status(400)
      .send("Missing authorization code or userId in callback.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    redirectURI
  );

  try {
    // so it says it doesnt need await, after having the server crash and having to reset credentials, it does in fact need await
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      // Save Google refresh token to Clerk private metadata
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          googleRefreshToken: tokens.refresh_token,
        },
      });
      console.log(`Saved Google refresh token for user ${userId}`);
      // let the backend know that this user is connected to their gmail
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          googleConnected: true,
        },
      });
      console.log(`Marked user ${userId} as connected to Google`);
    } else {
      res.redirect(`http://localhost:5173`);
      console.log(`User ${userId} is already connected`);
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          googleConnected: true,
        },
      });
      console.log(`Marked user ${userId} as connected to Google`);
    }

    // Redirect back to frontend after success
    res.redirect(`http://localhost:5173`);
  } catch (err) {
    console.error("Error exchanging code for Google tokens:", err);
    res.status(500).send("Failed to connect Google account.");
  }
});

// Optional test route
oauthRouter.get("/test", (req, res) => {
  res.send("OAuth router is working!");
});

export default oauthRouter;
