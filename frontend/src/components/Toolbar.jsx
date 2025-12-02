import React, { useRef } from "react";

const Toolbar = ({
  onUploadFiles,
  onExportPDF,
  speechState,
  startSpeaking,
  stopSpeaking,
  startListening,
  stopListening,
}) => {
  const fileInputRef = useRef(null);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onUploadFiles) {
      onUploadFiles(files);
    }
  };

  return (
    <div className="toolbar">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button
        type="button"
        className="toolbar-btn"
        title="Upload image / PDF"
        onClick={handleAttachClick}
      >
        📎
      </button>

      {/* Speech to text */}
      {speechState.listening ? (
        <button
          type="button"
          className="toolbar-btn listening"
          title="Stop listening"
          onClick={stopListening}
        >
          🛑
        </button>
      ) : (
        <button
          type="button"
          className="toolbar-btn"
          title="Speak your question"
          onClick={startListening}
        >
          🎙
        </button>
      )}

      {/* Text to speech */}
      {speechState.speaking ? (
        <button
          type="button"
          className="toolbar-btn speaking"
          title="Stop reading"
          onClick={stopSpeaking}
        >
          🔇
        </button>
      ) : (
        <button
          type="button"
          className="toolbar-btn"
          title="Listen to AI answer"
          onClick={startSpeaking}
        >
          🔊
        </button>
      )}

      {/* Export PDF */}
      <button
        type="button"
        className="toolbar-btn"
        title="Export chat (PDF)"
        onClick={onExportPDF}
      >
        📄
      </button>
    </div>
  );
};

export default Toolbar;
