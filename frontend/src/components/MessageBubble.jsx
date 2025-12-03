// src/components/MessageBubble.jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MessageBubble = ({ role, text, theme }) => {
  const isUser = role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleSpeak = () => {
    const synth = window.speechSynthesis;

    // Stop speaking
    if (isSpeaking && !isPaused) {
      synth.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    // Resume if paused
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      return;
    }

    // Start new speak
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1.07;

    utter.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synth.speak(utter);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (!isSpeaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const getLabel = () => {
    if (isPaused) return "▶ Resume";
    if (isSpeaking) return "⏸ Pause / ⏹ Stop";
    return "🔊 Speak";
  };

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      
      {/* Avatar bubble */}
      {!isUser && <div className="bubble-avatar ai-avatar" />}

      <div className={`msg-bubble ${isUser ? "user" : "ai"} ${theme}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#38bdf8", fontWeight: 600 }}
              >
                {children}
              </a>
            ),
            p: ({ children }) => <p style={{ margin: "6px 0" }}>{children}</p>,
            li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
            code: ({ children }) => (
              <code
                style={{
                  background: "#1e293b",
                  padding: "3px 6px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                }}
              >
                {children}
              </code>
            ),
          }}
        >
          {text}
        </ReactMarkdown>

        {/* 🎤 Speaker Button - Single Toggle */}
        {!isUser && (
          <button
            onClick={() => {
              if (isSpeaking && !isPaused) handlePause();
              else handleSpeak();
            }}
            style={{
              marginTop: "8px",
              background: "transparent",
              color: "#60a5fa",
              border: "none",
              padding: "4px 6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            {getLabel()}
          </button>
        )}
      </div>

      {isUser && <div className="bubble-avatar user-avatar" />}
    </div>
  );
};

export default MessageBubble;
