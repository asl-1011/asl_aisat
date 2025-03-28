"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion } from "framer-motion";
import { DollarSign, Trophy, Users, BarChart, Edit, Plus, Trash2 } from "lucide-react";
import Navbar from "@components/Navbar.jsx";
import { ProfileHeader } from "@components/profile/ProfileHeader.jsx";
import { StatsCard } from "@components/profile/StatsCard.jsx";

const fetcher = (url) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  });

export default function ManagerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const { data: managerData, error, mutate } = useSWR("/api/manager/profile", fetcher);
  const { data: playersData } = useSWR("/api/manager/players_list", fetcher);

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
    budgetBalance: "--",
    winPercentage: "--",
    matchWin: "--",
    managerRank: "--",
    players: [],
  };

  const availablePlayers = playersData?.map((player) => ({
    id: player._id.toString(),
    name: player.full_name || "Unknown",
    team: player.team_name || "Unknown",
    salary: player.salary || 0,
    points: player.total_points || 0,
  })) || [];

  const yourPlayers = profileData.players?.map((player) => ({
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
      if (!response.ok) throw new Error("Failed to add player");
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profileData.name}</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <Edit size={16} /> {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* ✅ Updated Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          <StatsCard 
            icon={DollarSign} 
            iconColor="text-green-500" 
            label="Budget Spent" 
            value={`$${profileData.budgetSpent}`} 
            subtitle={`Balance: $${profileData.budgetBalance}`} 
          />
          <StatsCard 
            icon={BarChart} 
            iconColor="text-blue-500" 
            label="Win Percentage" 
            value={`${profileData.winPercentage}%`} 
            subtitle="Based on total matches played" 
          />
          <StatsCard 
            icon={Trophy} 
            iconColor="text-yellow-500" 
            label="Matches Won" 
            value={profileData.matchWin} 
            subtitle="Total victories so far" 
          />
          <StatsCard 
            icon={Users} 
            iconColor="text-purple-500" 
            label="Manager Rank" 
            value={`#${profileData.managerRank}`} 
            subtitle="Leaderboard position" 
          />
        </div>
      </motion.div>

      {/* ✅ Your Players List */}
      <div className="mt-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Players</h2>
        {yourPlayers.length === 0 ? (
          <p className="text-gray-500">You haven't added any players yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {yourPlayers.map((player) => (
              <div key={player.id} className="p-4 border rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="text-md font-semibold">{player.name}</h3>
                  <p className="text-gray-500">{player.team}</p>
                  <p className="text-gray-700 font-medium">${player.salary} | Points: {player.points}</p>
                </div>
                <button
                  onClick={() => handleRemovePlayer(player.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Available Players List */}
      <div className="mt-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Players</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePlayers.map((player) => (
            <div key={player.id} className="p-4 border rounded-lg shadow flex justify-between items-center">
              <div>
                <h3 className="text-md font-semibold">{player.name}</h3>
                <p className="text-gray-500">{player.team}</p>
                <p className="text-gray-700 font-medium">${player.salary} | Points: {player.points}</p>
              </div>
              <button
                onClick={() => handleAddPlayer(player.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
