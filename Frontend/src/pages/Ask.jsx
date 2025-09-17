import { useUser } from "@clerk/clerk-react";
import { useRef, useState } from "react";

const Ask = () => {
  const { user } = useUser();
  const { geminiConnected } = user.publicMetadata;
  let textareaRef = useRef(null);
  let outputRef = useRef(null);
  const [nullCounter, setNullCounter] = useState(0);

  function handleResize(e) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }

  async function handleSearch(e) {
    // funny ahh validations cus lowk was bored doing backend and dealing with Gemini
    if (textareaRef.current.value.trim() === "") {
      let funnyPhrases = [
        "You gotta gimme a question first jeee",
        "I'm not a mind reader, you know!",
        "Ask me something, anything!",
        "Don't be shy, type your question!",
        "I'm all ears, what's on your mind?",
      ];
      setNullCounter((prev) => prev + 1);
      if (nullCounter >= 5 && nullCounter < 10) {
        let annoyedPhrases = [
          "Dude, seriously? Type something!",
          "I'm starting to think you're ignoring me...",
          "OKOK I get it, give me a prompt already!",
          "This is getting awkward... just ask a question!",
          "Fine, I'll wait here forever then...",
        ];
        textareaRef.current.placeholder =
          annoyedPhrases[Math.floor(Math.random() * annoyedPhrases.length)];
        return;
      } else if (nullCounter >= 10) {
        textareaRef.current.placeholder = "Yeah, just shut up bro";
        return;
      }
      textareaRef.current.placeholder =
        funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)];
      return;
    }
    let prompt = textareaRef.current.value;
    textareaRef.current.value = "";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";

    const response = await fetch("http://localhost:3000/gemini/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        prompt: prompt,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Search response:", data);

      outputRef.current.value = data.text;
    } else {
      console.log("Error fetching search response:", data.error);
    }
  }
  return (
    <>
      {geminiConnected && (
        <div className="ask-cont">
          <h1>Ask a Question</h1>
          <p>
            Here, Mailsie can remind you of anything from your past email chats!
            Just.. Ask!
          </p>
          <div className="textarea-cont">
            <textarea
              ref={outputRef}
              placeholder="Mailsie will answer here..."
              readOnly
              className="output-area"
            />
            <textarea
              ref={textareaRef}
              placeholder="Type your question here..."
              onInput={(e) => {
                handleResize(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
            />
          </div>
        </div>
      )}
      {!geminiConnected && (
        <h1 style={{ textAlign: "center", marginTop: "2rem" }}>
          Please connect your Gemini account to use the Ask feature.
        </h1>
      )}
    </>
  );
};

export default Ask;
