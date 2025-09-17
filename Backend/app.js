import express from "express";
import cors from "cors";
import gmailRouter from "./gmail.js";
import geminiRouter from "./gemini.js";
import oauthRouter from "./oauth.js";
import { clerkMiddleware } from "@clerk/express";
// gonna be needing this later: (2/7/25)
// import mysql from 'mysql2';
// when is later (18/7/25)

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use("/oauth", oauthRouter);
app.use("/gmail", gmailRouter);
app.use("/gemini", geminiRouter);

app.get("/", (req, res) => {
  console.log("MailEnds backend is running.");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
