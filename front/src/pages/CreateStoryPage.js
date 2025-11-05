import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateStoryPage() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/stories/", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      if (res.ok) {
        alert("Story uploaded!");
        navigate("/profile/" + localStorage.getItem("username"));
      } else {
        const errText = await res.text();
        console.error("Upload failed:", errText);
        alert("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        textAlign: "center",
      }}
    >
      <h2>Create Story</h2>
      <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleUpload}
          style={{
            padding: "10px 20px",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Upload
        </button>
      </div>
      <p style={{ marginTop: "10px", fontSize: "12px", color: "gray" }}>
        Videos will be trimmed to 30 seconds automatically.
      </p>
    </div>
  );
}
