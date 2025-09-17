import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { listMessages, listReplies } from "../gmail.js";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function replyMail(email, prompt, userName, recipientName) {
  const mailResponse = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Email: ${email}`,
    config: {
      systemInstruction: `Reply to this email provided and the reply should be based on the user's intent ${prompt}. Your name is: ${userName}, act as if you are ${userName}, and the recipient's name who you are writing the reply to is: ${recipientName} do not have any blanks like [recipient name] or [date] AT ALL.. try your best to fill those in with the context you have, or remove that particular part`,
      maxOutputTokens: 1200,
      stopSequences: [],
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
  });
  // console.log(mailResponse);

  return { text: mailResponse.text, usageMetadata: mailResponse.usageMetadata };
}
export async function generateMail(prompt, userName, recipientName) {
  const mailResponse = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${prompt}`,
    config: {
      systemInstruction: `Generate a professional email based on the user's input. The mail sender's Name: ${userName} who you're going to act as as you write the email, and the recipient's Name: ${recipientName} who you're writing to. Do not have any blanks like [recipient name] or [date] AT ALL.. try your best to fill those in with the recipient name and user name which you have been given, or remove that particular part`,
      maxOutputTokens: 500,
      stopSequences: [],
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
  });
  console.log(userName, recipientName);

  return { text: mailResponse.text, usageMetadata: mailResponse.usageMetadata };
}

export async function searchMail(userId, prompt) {
  const mails = [];
  const messages = await listMessages(userId);
  if (Array.isArray(messages)) {
    mails.push(...messages);
  }
  const replies = await listReplies(userId);
  if (Array.isArray(replies)) {
    mails.push(...replies);
  }

  const searchResponse = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
    Here are your mails: ${mails}
    The question related to the mails: ${prompt}`,
    config: {
      systemInstruction: `You are an email assistant named Mailsie. You are given an array of emails. The array contains the date, email, and content. Use the emails to answer the user's question. If you don't know the answer, just say that you don't know. Do not try to make up an answer. Be concise and clear with your answer.`,
      // maxOutputTokens: 1500,
      stopSequences: [],
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
  });
  console.log(searchResponse);
  return {
    text: searchResponse.text,
    usageMetadata: searchResponse.usageMetadata,
  };
}
