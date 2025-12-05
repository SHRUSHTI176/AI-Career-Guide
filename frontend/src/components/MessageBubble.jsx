// src/components/MessageBubble.jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const backendURL = "https://ai-career-guide-backend-v2.onrender.com";

const MessageBubble = ({ role, text, theme }) => {
  const isUser = role === "user";

  const [audioObj, setAudioObj] = useState(null);
  const [audioStatus, setAudioStatus] = useState("idle"); 
  // idle | playing | paused

  const handlePlayPauseResume = async () => {
    try {
      if (audioStatus === "idle") {
        // Ask backend for audio file
        const res = await fetch(`${backendURL}/api/v1/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const data = await res.json();
        if (!data.url) return;

        const audio = new Audio(`${backendURL}${data.url}`);
        setAudioObj(audio);

        audio.play();
        setAudioStatus("playing");

        audio.onended = () => {
          setAudioStatus("idle");
          setAudioObj(null);
        };
      } 
      else if (audioStatus === "playing") {
        audioObj.pause();
        setAudioStatus("paused");
      }
      else if (audioStatus === "paused") {
        audioObj.play();
        setAudioStatus("playing");
      }
    } catch (error) {
      console.error("Audio Error:", error);
    }
  };

  const handleStop = () => {
    if (audioObj) {
      audioObj.pause();
      audioObj.currentTime = 0;
      setAudioStatus("idle");
      setAudioObj(null);
    }
  };

  const getPlayIcon = () => {
    if (audioStatus === "idle") return "🔊";   // Play
    if (audioStatus === "playing") return "⏸"; // Pause
    if (audioStatus === "paused") return "▶️"; // Resume
  };

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      
      {!isUser && <div className="bubble-avatar ai-avatar" />}

      <div className={`msg-bubble ${isUser ? "user" : "ai"} ${theme}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>

        {/* ✔ Speaker controls only for AI */}
        {!isUser && (
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <span
              style={{ cursor: "pointer", fontSize: "22px" }}
              onClick={handlePlayPauseResume}
            >
              {getPlayIcon()}
            </span>

            {/* ⏹ Stop Button */}
            {audioStatus !== "idle" && (
              <span
                style={{ cursor: "pointer", fontSize: "22px" }}
                onClick={handleStop}
              >
                ⏹
              </span>
            )}
          </div>
        )}

      </div>

      {isUser && <div className="bubble-avatar user-avatar" />}
    </div>
  );
};

export default MessageBubble;
