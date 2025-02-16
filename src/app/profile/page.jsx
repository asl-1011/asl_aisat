"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@components/Navbar.jsx";
import { DollarSign, Trophy, Users, BarChart, ChevronDown } from "lucide-react";
import { ProfileHeader } from "@components/profile/ProfileHeader.jsx";
import { StatsCard } from "@components/profile/StatsCard.jsx";
import { motion } from "framer-motion";

export default function ManagerProfile() {
  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
    team: "",
    budgetSpent: "",
    winPercentage: "",
    match_win: 0,
    managerRank: 0,
    players: [],
  });
  const [expandedPlayer, setExpandedPlayer] = useState(null);

  useEffect(() => {
    fetch("/api/manager/profile")
      .then((res) => res.json())
      .then((data) => setManagerData(data))
      .catch((err) => console.error("Failed to fetch manager data:", err));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full px-6 sm:px-8 py-6 bg-gray-50 rounded-2xl shadow-2xl"
    >
      <ProfileHeader
        coverImage="https://static.vecteezy.com/system/resources/previews/035/784/023/non_2x/ai-generated-a-soccer-ball-on-the-grass-in-front-of-a-goal-free-photo.jpg"
        profileImage="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        isPro={false}
      />

      <motion.div className="mt-6 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 w-full">
        <div className="text-center sm:text-left border-b pb-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{managerData.name || "Loading..."}</h1>
          <p className="text-gray-500 text-sm sm:text-md mt-1">
            📧 Email: <span className="text-gray-800">{managerData.email}</span>
          </p>
          <p className="text-gray-500 text-sm sm:text-md mt-1">
            ⚽ Team: <span className="text-blue-600 font-semibold">{managerData.team}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <StatsCard icon={DollarSign} iconColor="text-green-500" label="Budget Spent" value={managerData.budgetSpent} />
          <StatsCard icon={BarChart} iconColor="text-purple-500" label="Win %" value={managerData.winPercentage} />
          <StatsCard icon={Trophy} iconColor="text-yellow-500" label="Matches Won" value={managerData.match_win} />
          <StatsCard icon={Users} iconColor="text-red-500" label="Manager Rank" value={`#${managerData.managerRank}`} />
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">MY PLAYERS</h2>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {managerData.players.length > 0 ? (
              managerData.players.map((player, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out transform"
                >
                  <div className="flex items-center space-x-4">
                    <img className="w-16 h-16 rounded-full" src={player.profilePic} alt={player.name} />
                    <div>
                      <h3 className="font-semibold text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-600">{player.position}</p>
                    </div>
                    <div className="ml-auto cursor-pointer" onClick={() => setExpandedPlayer(expandedPlayer === index ? null : index)}>
                      <ChevronDown className={`transform ${expandedPlayer === index ? "rotate-180" : ""} transition-transform`} size={20} />
                    </div>
                  </div>
                  {expandedPlayer === index && (
                    <div className="mt-4 space-y-2">
                      <p className="text-gray-700">
                        <strong>Price:</strong> ${player.price}
                      </p>
                      <p className="text-gray-700">
                        <strong>Points:</strong> {player.points}
                      </p>
                      <p className="text-gray-700">
                        <strong>Goals:</strong> {player.goals}
                      </p>
                    </div>
                  )}
                </div>
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
