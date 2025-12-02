import React from "react";

const SettingsPanel = ({ userName, setUserName, aiName, setAiName }) => {
  const handleUserChange = () => {
    const val = prompt("Enter your display name:", userName);
    if (val) setUserName(val);
  };

  const handleAiChange = () => {
    const val = prompt("Enter AI mentor name:", aiName);
    if (val) setAiName(val);
  };

  return (
    <div className="settings-panel">
      <button className="settings-row" type="button" onClick={handleUserChange}>
        👤 Change your name
      </button>
      <button className="settings-row" type="button" onClick={handleAiChange}>
        🤖 Change AI name
      </button>
    </div>
  );
};

export default SettingsPanel;
