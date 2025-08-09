import React, { useState } from "react";

const Settings: React.FC = () => {
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Later: Save to Firebase
    console.log("Saving settings:", { username, profilePic });
    alert("Settings saved! (Not yet connected to backend)");
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Username field */}
      <label className="block mb-4">
        <span className="text-gray-700">Username</span>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
      </label>

      {/* Profile picture upload */}
      <div className="mb-4">
        <span className="text-gray-700">Profile Picture</span>
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full"
          onChange={handleProfilePicChange}
        />
        {profilePic && (
          <img
            src={profilePic}
            alt="Preview"
            className="mt-4 w-32 h-32 object-cover rounded-full"
          />
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
      >
        Save Changes
      </button>
    </div>
  );
};

export default Settings;
