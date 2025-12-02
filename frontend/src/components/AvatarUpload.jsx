import React, { useRef, useState, useEffect } from "react";

const AvatarUpload = ({ userName }) => {
  const fileRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("ai-career-user-avatar");
    if (stored) setAvatarUrl(stored);
  }, []);

  const handleClick = () => fileRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      setAvatarUrl(url);
      localStorage.setItem("ai-career-user-avatar", url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="avatar-block">
      <div className="avatar-circle" onClick={handleClick}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="User avatar" />
        ) : (
          <span className="avatar-initial">
            {userName?.[0]?.toUpperCase() || "U"}
          </span>
        )}
      </div>
      <p className="avatar-label">You</p>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
};

export default AvatarUpload;
