"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Navbar from "@components/Navbar.jsx";
import {
  DollarSign,
  Plus,
  Trophy,
  Users,
  BarChart,
  LogOut,
  ChevronDown,
  Edit,
} from "lucide-react";
import { ProfileHeader } from "@components/profile/ProfileHeader.jsx";
import { StatsCard } from "@components/profile/StatsCard.jsx";
import PlayersSection from "@components/profile/MyPlayerSection.jsx";
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
  const { data: playersData } = useSWR("/api/manager/players_list", fetcher);

  const {
    data: managerData,
    error,
    mutate,
  } = useSWR("/api/manager/profile", fetcher, {
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
    budget_balance: "--",
    matchWin: "--",
    managerRank: "--",
    profilePic: "/default-profile.png",
    coverPic: "/default-cover.jpg",
    players: [],
  };
  const availablePlayers =
    playersData?.map((player) => ({
      id: player._id.toString(),
      name: player.full_name || "Unknown",
      team: player.team_name || "Unknown",
      salary: player.salary || 0,
      points: player.total_points || 0,
    })) || [];

  const yourPlayers =
    profileData.players?.map((player) => ({
      id: player.id,
      name: player.name || "Unknown",
      team: player.team || "Unknown",
      salary: player.price || 0,
      points: player.points || 0,
    })) || [];

  const handleAddPlayer = async (playerId) => {
    try {
      const response = await fetch("/api/manager/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addPlayer: playerId }),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to add player");
      mutate();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      const response = await fetch("/api/manager/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ removePlayer: playerId }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to remove player");
      mutate();
    } catch (error) {
      alert(error.message);
    }
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
      if (!response.ok)
        throw new Error(result.message || "Failed to update profile");
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
      <ProfileHeader
        coverImage={profileData.coverPic}
        profileImage={profileData.profilePic}
        isPro={false}
      />
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
                await fetch("/api/logout", {
                  method: "POST",
                  credentials: "include",
                });
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
            <p className="text-gray-500 text-sm sm:text-md mt-1">
              📧 Email:{" "}
              <span className="text-gray-800">{profileData.email}</span>
            </p>
            <p className="text-gray-500 text-sm sm:text-md mt-1">
              ⚽ Team:{" "}
              <span className="text-blue-600 font-semibold">
                {profileData.team}
              </span>
            </p>
          </>
        ) : (
          <div className="mt-4 space-y-4">
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter Name"
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
            />
            <input
              type="text"
              name="team"
              value={formData.team}
              onChange={handleInputChange}
              placeholder="Enter Team Name"
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
            />
            <button
              onClick={handleUpdateProfile}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
            >
              Save Changes
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          <StatsCard
            icon={DollarSign}
            iconColor="text-green-500"
            label="Budget Spent"
            value={profileData.budgetSpent}
          />
          <StatsCard
            icon={BarChart}
            iconColor="text-purple-500"
            label="Balance"
            value={profileData.budget_balance}
          />
          
          <StatsCard
            icon={Users}
            iconColor="text-red-500"
            label="Manager Rank"
            value={`#${profileData.managerRank}`}
          />
        </div>

        <PlayersSection
          profileData={profileData}
          expandedPlayer={expandedPlayer}
          setExpandedPlayer={setExpandedPlayer}
        />
        {/* ✅ Available Players List */}
        {/* ✅ Available Players List */}
        <div className="mt-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Available Players
          </h2>

          {/* Grid Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className="p-5 border rounded-xl shadow-md flex items-center justify-between transition hover:shadow-lg hover:scale-105"
              >
                {/* Player Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {player.name}
                  </h3>
                  <p className="text-gray-600">{player.team}</p>
                  <p className="text-gray-900 font-medium">
                    ${player.salary} |{" "}
                    <span className="text-blue-600">
                      Points: {player.points}
                    </span>
                  </p>
                </div>

                {/* Add Player Button */}
                <button
                  onClick={() => handleAddPlayer(player.id)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95"
                  aria-label={`Add ${player.name}`}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <Navbar />
    </motion.div>
  );
}
