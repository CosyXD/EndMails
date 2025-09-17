import express from "express";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
import { clerkClient } from "@clerk/express";

dotenv.config();
const gmailRouter = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function listMessages(userId) {
  const user = await clerkClient.users.getUser(userId);
  const { googleRefreshToken } = user.privateMetadata;
  if (!googleRefreshToken) {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { googleRefreshToken: null },
      publicMetadata: { googleConnected: false },
    });
    console.log(`No Google refresh token for user ${userId}`);
    return {
      error: "Google authentication expired. Please reconnect your account.",
    };
  }
  try {
    oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      labelIds: ["CATEGORY_PERSONAL"],
    });
    const messages = res.data.messages;
    let msgContentArr = [];
    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      let msgContent = "";
      let foundPlain = false;

      if (msg.data.payload.parts) {
        for (const part of msg.data.payload.parts) {
          if (part.mimeType === "text/plain" && part.body && part.body.data) {
            msgContent = Buffer.from(part.body.data, "base64").toString(
              "utf-8"
            );
            foundPlain = true;
            break;
          }
        }
        // fallback to text/html if no text/plain found
        if (!foundPlain) {
          continue;
        }
      }

      if (!msgContent) {
        continue;
      }

      let msgHeaders = msg.data.payload.headers.find(
        (header) => header.name === "From"
      ).value;
      let msgDate = msg.data.payload.headers.find(
        (header) => header.name === "Date"
      ).value;
      const date = new Date(msgDate);
      const month = date.toLocaleString("en-US", { month: "short" });
      const day = date.getDate();
      let msgEmail = msgHeaders.split("<")[1].split(">")[0];
      let msgSenderName = msgHeaders.split("<")[0].trim();
      msgContentArr.push({
        sender: msgSenderName,
        email: msgEmail,
        content: msgContent,
        date: `${month} ${day}`,
        id: message.id,
      });
    }
    return msgContentArr;
  } catch (error) {
    // Handle token expiry or invalid_grant
    if (
      error.response &&
      error.response.data &&
      (error.response.data.error === "invalid_grant" ||
        error.response.data.error === "invalid_request")
    ) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { googleRefreshToken: null },
        publicMetadata: { googleConnected: false },
      });
      console.log(`Cleared invalid Google token for user ${userId}`);
      return {
        error: "Google authentication expired. Please reconnect your account.",
      };
    }
    // Other errors
    console.error("Error fetching messages:", error);
    return { error: "Failed to fetch messages from Gmail." };
  }
}
export async function listReplies(userId) {
  const user = await clerkClient.users.getUser(userId);
  const { googleRefreshToken } = user.privateMetadata;
  if (!googleRefreshToken) {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { googleRefreshToken: null },
      publicMetadata: { googleConnected: false },
    });
    console.log(`No Google refresh token for user ${userId}`);
    return {
      error: "Google authentication expired. Please reconnect your account.",
    };
  }
  try {
    oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      labelIds: ["SENT"],
    });
    const messages = res.data.messages;
    let msgContentArr = [];
    for (const message of messages) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      let msgContent = "";

      if (
        msg.data.payload.mimeType === "text/plain" &&
        msg.data.payload.body &&
        msg.data.payload.body.data
      ) {
        msgContent = Buffer.from(msg.data.payload.body.data, "base64").toString(
          "utf-8"
        );
      }

      let msgDate = msg.data.payload.headers.find(
        (header) => header.name === "Date"
      ).value;
      const toHeader = msg.data.payload.headers.find(
        (header) => header.name === "To"
      ).value;

      const date = new Date(msgDate);
      const month = date.toLocaleString("en-US", { month: "short" });
      const day = date.getDate();
      msgContentArr.push({
        content: msgContent,
        date: `${month} ${day}`,
        email: toHeader,
        id: message.id,
      });
    }
    return msgContentArr;
  } catch (error) {
    if (
      error.response &&
      error.response.data &&
      (error.response.data.error === "invalid_grant" ||
        error.response.data.error === "invalid_request")
    ) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { googleRefreshToken: null },
        publicMetadata: { googleConnected: false },
      });
      console.log(`Cleared invalid Google token for user ${userId}`);
      return {
        error: "Google authentication expired. Please reconnect your account.",
      };
    }
    console.error("Error fetching sent messages:", error);
    return { error: "Failed to fetch sent messages from Gmail." };
  }
}

async function sendMail(to, subject, text, userId) {
  const user = await clerkClient.users.getUser(userId);
  const { googleRefreshToken } = user.privateMetadata;
  oauth2Client.setCredentials({
    refresh_token: googleRefreshToken,
  });
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = [
      `To: ${to}`,
      "Content-Type: text/plain; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: ${subject}`,
      "",
      text,
    ].join("\n");
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: Buffer.from(raw).toString("base64"),
      },
    });
    console.log("Email sent:", result.data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

listReplies("user_32MslcCwgqRtt2MgKeCLhGjNgxl");

gmailRouter.get("/recents", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  try {
    const messages = await listMessages(userId);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

gmailRouter.get("/replies", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  try {
    const messages = await listReplies(userId);
    console.log(messages);

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

gmailRouter.post("/send", async (req, res) => {
  try {
    const { to, subject, text, userId } = req.body;
    await sendMail(to, subject, text, userId);
    res.status(200).send({ message: "Email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

// Test function for manual testing (not used in routes)
async function test(userId) {
  const user = await clerkClient.users.getUser(userId);
  const { googleRefreshToken } = user.privateMetadata;
  console.log(googleRefreshToken);
}

export default gmailRouter;
