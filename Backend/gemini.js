import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import { clerkClient } from "@clerk/express";
import { generateMail, replyMail, searchMail } from "./components/gemini.js";

dotenv.config();

const geminiRouter = express.Router();

geminiRouter.post("/connect", async (req, res) => {
  const { apiKey, userId } = req.body;

  if (!apiKey || !userId) {
    return res.status(400).json({ error: "API key and User ID are required" });
  }

  try {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        geminiApiKey: apiKey,
      },
    });
    console.log("Connected to Gemini API successfully");
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        geminiConnected: true,
      },
    });
  } catch (error) {
    console.error("Error connecting to Gemini API:", error);
    return res.status(500).json({ error: "Failed to connect to Gemini API" });
  }

  res.json({ message: "Connected to Gemini API successfully" });
});

geminiRouter.post("/generate", async (req, res) => {
  const { email, prompt, userName, recipientName } = req.body;
  try {
    const mailResponse = await replyMail(
      email,
      prompt,
      userName,
      recipientName
    );
    res.send(mailResponse);
    // console.log(mailResponse);
  } catch (error) {
    console.error("Error generating email:", error);
    res.status(500).send("Error generating email");
  }
});

geminiRouter.post("/generate-new", async (req, res) => {
  const { prompt, userName, recipientName } = req.body;

  try {
    const mailResponse = await generateMail(prompt, userName, recipientName);
    res.send(mailResponse);
    // console.log(mailResponse);
  } catch (error) {
    console.error("Error generating email:", error);
    res.status(500).send("Error generating email");
  }
});

geminiRouter.post("/ask", async (req, res) => {
  const { userId, prompt } = req.body;
  console.log("userId:", userId);
  console.log("prompt:", prompt);

  try {
    const searchResponse = await searchMail(userId, prompt);
    res.send(searchResponse);
  } catch (error) {
    console.error("Error searching emails:", error);
    res.status(500).send("Error searching emails");
  }
});

export default geminiRouter;
