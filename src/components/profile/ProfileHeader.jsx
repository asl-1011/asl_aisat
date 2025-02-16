import React from 'react';

export function ProfileHeader({ coverImage, profileImage, isPro = false }) {
  return (
    <div className="relative mb-8">
      <div 
        className="h-48 w-full rounded-xl bg-cover bg-center"
        style={{
          backgroundImage: `url('${coverImage}')`,
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.4)"
        }}
      ></div>
      
      <div className="absolute -bottom-16 left-4">
        <div className="relative">
          <img
            src={profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
          {isPro && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              PRO
            </div>
          )}
        </div>
      </div>
    </div>
  );
}