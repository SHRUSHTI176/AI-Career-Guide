import React from "react";

const SUGGESTIONS = [
  "I am in 2nd year CSE and want to become a software developer. What should I do step-by-step?",
  "Help me design a roadmap to get an internship in my domain.",
  "Review my current skills and tell me what to learn next.",
  "Give me a weekly study + project + revision plan.",
];

const QuickReplies = ({ onSelect }) => {
  return (
    <div className="quick-replies">
      {SUGGESTIONS.map((s, idx) => (
        <button
          key={idx}
          type="button"
          className="quick-chip"
          onClick={() => onSelect && onSelect(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
