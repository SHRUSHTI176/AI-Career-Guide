// src/components/MessageBubble.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MessageBubble = ({ role, text, theme }) => {
  const isUser = role === "user";

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
      </div>

      {isUser && <div className="bubble-avatar user-avatar" />}
    </div>
  );
};

export default MessageBubble;
