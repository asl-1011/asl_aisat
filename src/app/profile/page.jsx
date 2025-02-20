"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Navbar from "@components/Navbar.jsx";
import { DollarSign, Trophy, Users, BarChart, LogOut, ChevronDown, Edit } from "lucide-react";
import { ProfileHeader } from "@components/profile/ProfileHeader.jsx";
import { StatsCard } from "@components/profile/StatsCard.jsx";
import { motion } from "framer-motion";

const fetcher = (url) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  });

export default function ManagerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const { data: managerData, error, mutate } = useSWR("/api/manager/profile", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (error) {
      router.push("/login");
    }
  }, [error, router]);

  if (error) return null;

  const profileData = managerData || {
    name: "Loading...",
    email: "Loading...",
    team: "Loading...",
    budgetSpent: "--",
    winPercentage: "--",
    matchWin: "--",
    managerRank: "--",
    profilePic: "/default-profile.png",
    coverPic: "/default-cover.jpg",
    players: [],
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    setErrorMessage("");
    try {
      const response = await fetch("/api/manager/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update profile");
      mutate();
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 rounded-2xl shadow-xl"
    >
      <ProfileHeader coverImage={profileData.coverPic} profileImage={profileData.profilePic} isPro={false} />
      <motion.div className="mt-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
            {profileData.name}
          </h1>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-end mt-4 sm:mt-0">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setFormData({ name: profileData.name, team: profileData.team });
              }}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              <Edit size={16} /> {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST", credentials: "include" });
                router.push("/login");
              }}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        {!isEditing ? (
          <>
            <p className="text-gray-500 text-sm sm:text-md mt-1">📧 Email: <span className="text-gray-800">{profileData.email}</span></p>
            <p className="text-gray-500 text-sm sm:text-md mt-1">⚽ Team: <span className="text-blue-600 font-semibold">{profileData.team}</span></p>
          </>
        ) : (
          <div className="mt-4 space-y-4">
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter Name" className="w-full p-2 border border-gray-300 rounded-md text-gray-900" />
            <input type="text" name="team" value={formData.team} onChange={handleInputChange} placeholder="Enter Team Name" className="w-full p-2 border border-gray-300 rounded-md text-gray-900" />
            <button onClick={handleUpdateProfile} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-full sm:w-auto">Save Changes</button>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          <StatsCard icon={DollarSign} iconColor="text-green-500" label="Budget Spent" value={profileData.budgetSpent} />
          <StatsCard icon={BarChart} iconColor="text-purple-500" label="Win %" value={profileData.winPercentage} />
          <StatsCard icon={Trophy} iconColor="text-yellow-500" label="Matches Won" value={profileData.matchWin} />
          <StatsCard icon={Users} iconColor="text-red-500" label="Manager Rank" value={`#${profileData.managerRank}`} />
        </div>
         {/* Players Section */}
         <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">MY PLAYERS</h2>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {profileData.players.length > 0 ? (
              profileData.players.map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  <div className="flex items-center space-x-4">
                    <img className="w-16 h-16 rounded-full" src={player.profilePic || "/default-profile.png"} alt={player.name || "Player"} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{player.name || "Loading..."}</h3>
                      <p className="text-sm text-gray-600">{player.position || "Loading..."}</p>
                    </div>
                    <button
                      className="ml-auto"
                      onClick={() => setExpandedPlayer(expandedPlayer === index ? null : index)}
                    >
                      <ChevronDown className={`transform ${expandedPlayer === index ? "rotate-180" : ""} transition-transform`} size={20} />
                    </button>
                  </div>
                  {expandedPlayer === index && (
                    <div className="mt-4 space-y-2">
                      <p className="text-gray-700"><strong>Price:</strong> ${player.price || "--"}</p>
                      <p className="text-gray-700"><strong>Points:</strong> {player.points || "--"}</p>
                      <p className="text-gray-700"><strong>Goals:</strong> {player.goals || "--"}</p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500">No players found.</p>
            )}
          </div>
        </div>
      </motion.div>
      <Navbar />
    </motion.div>
  );
}
