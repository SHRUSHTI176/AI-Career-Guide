// src/components/MessageBubble.jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MessageBubble = ({ role, text, theme }) => {
  const isUser = role === "user";

  const [audioObj, setAudioObj] = useState(null);
  const [audioState, setAudioState] = useState("idle");

  const backendURL = "https://ai-career-guide-backend-v2.onrender.com";

  const handleAudio = async () => {
    try {
      if (audioState === "idle") {
        const res = await fetch(`${backendURL}/api/v1/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const data = await res.json();
        if (!data.url) return;

        // Ensure no previous audio creates conflict
        if (audioObj) {
          audioObj.pause();
          audioObj.currentTime = 0;
        }

        const audio = new Audio(`${backendURL}${data.url}`);
        setAudioObj(audio);

        audio.play();
        setAudioState("playing");

        audio.onended = () => {
          setAudioState("idle");
          setAudioObj(null);
        };
      }
      else if (audioState === "playing") {
        audioObj.pause();
        setAudioState("paused");
      }
      else if (audioState === "paused") {
        audioObj.play();
        setAudioState("playing");
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setAudioState("idle");
    }
  };

  const stopAudio = () => {
    if (audioObj) {
      audioObj.pause();
      audioObj.currentTime = 0;
      setAudioState("idle");
      setAudioObj(null);
    }
  };

  const getIcon = () => {
    if (audioState === "idle") return "🔊";
    if (audioState === "playing") return "⏹";
    if (audioState === "paused") return "▶️";
  };

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      {!isUser && <div className="bubble-avatar ai-avatar" />}

      <div className={`msg-bubble ${isUser ? "user" : "ai"} ${theme}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>

        {!isUser && (
          <div
            style={{ cursor: "pointer", fontSize: "20px", marginTop: "8px" }}
            onClick={audioState === "playing" ? stopAudio : handleAudio}
          >
            {getIcon()}
          </div>
        )}
      </div>

      {isUser && <div className="bubble-avatar user-avatar" />}
    </div>
  );
};

export default MessageBubble;
