// src/components/MessageBubble.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MessageBubble = ({ role, text, theme }) => {
  const isUser = role === "user";

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      {/* Avatar for AI */}
      {!isUser && <div className="bubble-avatar ai-avatar" />}

      {/* Message Box */}
      <div className={`msg-bubble ${isUser ? "user" : "ai"} ${theme}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {text}
        </ReactMarkdown>
      </div>

      {/* Avatar for User */}
      {isUser && <div className="bubble-avatar user-avatar" />}
    </div>
  );
};

export default MessageBubble;
