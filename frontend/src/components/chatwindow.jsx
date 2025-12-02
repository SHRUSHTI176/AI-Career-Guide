// src/components/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  FaPlus,
  FaMicrophone,
  FaPaperPlane,
  FaCamera,
  FaImage,
  FaFilePdf,
  FaPause,
  FaPlay,
  FaStop,
} from "react-icons/fa";
import TypingIndicator from "./TypingIndicator";
import { useChat } from "../hooks/useChat";

const ChatWindow = ({
  theme,
  activeSessionId,
  setActiveSessionId,
  aiName,
  userName,
}) => {
  const {
    messages,
    input,
    setInput,
    isTyping,
    handleSend,
    quickReplies,
    speakText,
    stopSpeaking,
    speechState,
    startListening,
  } = useChat({ activeSessionId, setActiveSessionId, userName });

  const [showAttachments, setShowAttachments] = useState(false);
  const [currentlyPlayingText, setCurrentlyPlayingText] = useState("");

  const messageEndRef = useRef(null);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handlePlayVoice = (text) => {
    if (speechState.speaking && currentlyPlayingText === text) {
      stopSpeaking();
      setCurrentlyPlayingText("");
    } else {
      speakText(text);
      setCurrentlyPlayingText(text);
    }
  };

  const handlePause = () => window.speechSynthesis.pause();
  const handleResume = () => window.speechSynthesis.resume();

  const handleFileUpload = (e, label) => {
    if (!e.target.files[0]) return;
    alert(`${label} upload feature coming! 📎`);
  };

  // Bold + bullet format for AI responses
  const formatText = (text) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      if (line.startsWith("##")) return <h3 key={i}>{line.replace("##", "")}</h3>;
      if (line.startsWith("**") && line.endsWith("**"))
        return <strong key={i}>{line.replace(/\*/g, "")}</strong>;
      if (line.includes("•"))
        return <li key={i}>{line.replace("•", "")}</li>;
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div className="chat-wrapper-outer">
      {/* HEADER */}
      <header className="chat-top-header">
        <img src="/ai-avatar.png" className="ai-avatar-img" alt="AI" />
        <div>
          <strong>{aiName}</strong>
          <span className="ai-role-text">
            Your AI Mentor for careers & growth
          </span>
        </div>
      </header>

      {/* MESSAGE AREA */}
      <div className="chat-scroll-area">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`msg-row ${msg.role === "user" ? "user" : "ai"}`}
          >
            {msg.role === "ai" && (
              <img src="/ai-avatar.png" className="chat-avatar chat-avatar-ai" />
            )}

            <div
              className={`msg-bubble ${msg.role} ${
                theme === "dark" ? "dark" : "light"
              }`}
            >
              {formatText(msg.text)}
            </div>

            {msg.role === "user" && (
              <img
                src={localStorage.getItem("userAvatar") || "/default-user.png"}
                className="chat-avatar chat-avatar-user"
              />
            )}
          </div>
        ))}

        {isTyping && (
          <div className="typing-row">
            <img src="/ai-avatar.png" className="chat-avatar chat-avatar-ai" />
            <TypingIndicator />
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div className="quick-replies">
          {quickReplies.map((q, i) => (
            <button
              key={i}
              className="quick-btn"
              onClick={() => {
                setInput(q);
                handleSend();
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Floating Voice Controls */}
      {currentlyPlayingText && (
        <div className="voice-control-floating">
          <button className="voice-control-btn" onClick={handlePause}>
            <FaPause />
          </button>
          <button className="voice-control-btn" onClick={handleResume}>
            <FaPlay />
          </button>
          <button
            className="voice-control-btn stop"
            onClick={() => {
              stopSpeaking();
              setCurrentlyPlayingText("");
            }}
          >
            <FaStop />
          </button>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="chat-input-bar">
        <button
          className="circle-icon"
          onClick={() => setShowAttachments(!showAttachments)}
        >
          <FaPlus />
        </button>

        <input
          className="chat-input"
          placeholder="Ask your career doubts..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button className="circle-icon" onClick={startListening}>
          <FaMicrophone />
        </button>

        <button className="send-btn" onClick={handleSend}>
          <FaPaperPlane />
        </button>
      </div>

      {/* Attachment Sheet */}
      {showAttachments && (
        <div className="attachment-sheet">
          <button onClick={() => cameraRef.current.click()}>
            <FaCamera /> Camera
          </button>
          <button onClick={() => galleryRef.current.click()}>
            <FaImage /> Gallery
          </button>
          <button onClick={() => pdfRef.current.click()}>
            <FaFilePdf /> Upload PDF
          </button>

          <input
            type="file"
            ref={cameraRef}
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "Camera")}
            hidden
          />
          <input
            type="file"
            ref={galleryRef}
            accept="image/*"
            onChange={(e) => handleFileUpload(e, "Gallery")}
            hidden
          />
          <input
            type="file"
            ref={pdfRef}
            accept="application/pdf"
            onChange={(e) => handleFileUpload(e, "PDF")}
            hidden
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
