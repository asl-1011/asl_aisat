import React, { useState } from "react";
import { Upload, Trash2, Edit, Camera } from "lucide-react";

export function ProfileHeader({
  coverImage = "/placeholder.svg",
  profileImage = "/placeholder.svg",
  isPro = false,
  isVerified = false,
  onDeleteCover,
  onDeleteProfile,
}) 



{
  const [coverFile, setCoverFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [coverImagePreview, setCoverImage] = useState(coverImage);
  const [profileImagePreview, setProfileImage] = useState(profileImage);
  const [loadingCover, setLoadingCover] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
 
 
 
  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
  
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WEBP are allowed.");
      return;
    }
  
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds the 5MB limit.");
      return;
    }
  
    // Create a URL for preview
    const imageUrl = URL.createObjectURL(file);
  
    if (type === "cover") {
      setCoverImage(imageUrl);
      setCoverFile(file);
    } else {
      setProfileImage(imageUrl);
      setProfileFile(file);
    }
  
    // Wait for user confirmation before uploading
    const confirmUpload = window.confirm(`Do you want to upload this ${type} image?`);
    if (confirmUpload) {
      await uploadImage(type); // Upload if confirmed
    }
  };
  



  const uploadImage = async (type) => {
    const file = type === "cover" ? coverFile : profileFile;
    if (!file) return alert(`Please select a ${type} picture.`);
  
    const setLoading = type === "cover" ? setLoadingCover : setLoadingProfile;
    setLoading(true);
  
    const formData = new FormData();
    formData.append(`${type}Pic`, file);
  
    try {
      const response = await fetch("/api/manager/profile/images", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
  
      if (response.ok) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} picture updated!`);
        if (type === "cover") {
          setCoverImage(data.coverPicUrl);
          setCoverFile(null);
        } else {
          setProfileImage(data.profilePicUrl);
          setProfileFile(null);
        }
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };
  const deleteImage = async (pictureType) => {
    const response = await fetch("/api/manager/profile/image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pictureType }),
    });
  
    const data = await response.json();
    console.log(data);
  };
  // Delete Cover Pic
  
  return (
    <div className="relative mb-24 w-full max-w-6xl mx-auto">
      {/* Cover Image Section */}
      <div className="w-full h-48 sm:h-56 md:h-64 rounded-xl overflow-hidden relative group shadow-lg">
        <img
          src={coverImage}
          alt="Cover"
          className={`w-full h-full object-cover transition-all duration-700 ${
            coverLoaded ? "image-load" : "opacity-0 blur-md"
          }`}
          onLoad={() => setCoverLoaded(true)}
        />

        {/* Cover Image Edit Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
          <label className="cursor-pointer flex items-center gap-2 text-white px-4 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/50">
            <Edit size={18} strokeWidth={2} />
            <span>Change Cover</span>
            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "cover")} accept="image/*" />
          </label>

          {coverImagePreview !== "/placeholder.svg" && (
            <button
              onClick={onDeleteCover}
              className="text-white p-2.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 hover:bg-red-500/80"
            >
              <Trash2 size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="absolute -bottom-14 left-8 md:left-10 group">
        <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden">
          <img
            src={profileImage}
            alt="Profile"
            className={`w-full h-full object-cover transition-all duration-700 ${
              profileLoaded ? "image-load" : "opacity-0 blur-md"
            }`}
            onLoad={() => setProfileLoaded(true)}
          />

          {/* Profile Image Edit Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3">
            <label className="cursor-pointer flex items-center justify-center w-10 h-10 text-white bg-black/40 backdrop-blur-md rounded-full hover:bg-black/60">
              <Camera size={18} strokeWidth={2} />
              <input type="file" className="hidden" onChange={(e) => handleFileChange(e, "profile")} accept="image/*" />
            </label>

            {profileImagePreview !== "/placeholder.svg" && (
              <button
                onClick={onDeleteProfile}
                className="flex items-center justify-center w-10 h-10 text-white bg-black/40 backdrop-blur-md rounded-full hover:bg-red-500/80"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
