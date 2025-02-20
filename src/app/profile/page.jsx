"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Navbar from "@components/Navbar.jsx";
import { DollarSign, Trophy, Users, BarChart, ChevronDown, LogOut } from "lucide-react";
import { ProfileHeader } from "@components/profile/ProfileHeader.jsx";
import { StatsCard } from "@components/profile/StatsCard.jsx";
import { motion } from "framer-motion";

const fetcher = (url) => fetch(url, { credentials: "include" }).then((res) => {
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
});

export default function ManagerProfile() {
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const router = useRouter();

  const { data: managerData, error } = useSWR("/api/manager/profile", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (error) {
      router.push("/login");
    }
  }, [error, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (error) return null; // Prevent any rendering while redirecting

  const profileData = managerData || {
    name: "Loading...",
    email: "Loading...",
    team: "Loading...",
    budgetSpent: "--",
    winPercentage: "--",
    match_win: "--",
    managerRank: "--",
    profilePic: "/default-profile.png",
    coverPic: "/default-cover.jpg",
    players: [],
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full px-6 sm:px-8 py-6 bg-gray-50 rounded-2xl shadow-xl"
    >
      {/* Profile Header */}
      <ProfileHeader
        coverImage={profileData.coverPic}
        profileImage={profileData.profilePic}
        isPro={false}
      />

      {/* Profile Details */}
      <motion.div className="mt-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 w-full">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          {/* Name & Details */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profileData.name}</h1>
            
            {/* Logout Button (Immediately After Name) */}
            <button
              onClick={handleLogout}
              className="ml-4 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition duration-300"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <p className="text-gray-500 text-sm sm:text-md mt-1">
          📧 Email: <span className="text-gray-800">{profileData.email}</span>
        </p>
        <p className="text-gray-500 text-sm sm:text-md mt-1">
          ⚽ Team: <span className="text-blue-600 font-semibold">{profileData.team}</span>
        </p>

        {/* Manager Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
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
