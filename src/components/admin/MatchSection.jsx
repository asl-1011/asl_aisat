"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "lucide-react";
import dynamic from "next/dynamic";
import AddMatchForm from "@/components/admin/AddMatchForm";

const MatchCard = dynamic(() => import("@/components/admin/MatchCard"), { ssr: false });

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const matchVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } },
};

const CATEGORIES = ["all", "recent", "upcoming"];

const MatchSection = () => {
  const [matches, setMatches] = useState([]);
  const [category, setCategory] = useState("all");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [matchRes, teamRes] = await Promise.all([
          fetch("/api/admin/matches"),
          fetch("/api/admin/teams"),
        ]);

        if (!matchRes.ok || !teamRes.ok) throw new Error("Failed to fetch data");

        const [matchData, teamData] = await Promise.all([matchRes.json(), teamRes.json()]);

        setMatches(matchData);
        setTeams(teamData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredMatches = useMemo(() => {
    if (category === "all") return matches;
    return matches.filter((match) =>
      category === "recent" ? match.status === "Finished" : match.status === "Upcoming"
    );
  }, [matches, category]);

  const getTeamDetails = (teamId) => teams.find((team) => team._id === teamId) || {};

  async function handleDeleteMatch(id) {
    try {
      console.log("Deleting match with ID:", id); // Debugging log
  
      const response = await fetch(`/api/admin/matches?matchId=${id}`, {
        method: "DELETE",
      });
  
      const data = await response.json();
      console.log("Delete response:", data); // Debugging log
  
      if (!response.ok) throw new Error(data.error || "Failed to delete match");
  
      setMatches((prevMatches) => prevMatches.filter((match) => match._id !== id));
    } catch (err) {
      console.error("❌ Error deleting match:", err);
    }
  }
  
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border shadow-md p-4 hover:shadow-lg"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Timer className="w-5 h-5 text-blue-500 mr-2" /> Matches
      </h2>

      <div className="flex justify-center space-x-2 sm:space-x-4 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => category !== cat && setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              category === cat ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <AddMatchForm teams={teams}  />


      <AnimatePresence>
        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading matches...</p>
        ) : (
          <div className="space-y-4">
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match) => {
                const team1 = getTeamDetails(match.team1);
                const team2 = getTeamDetails(match.team2);
                return (
                    <MatchCard
                    key={match._id}
                    team1={match?.team1?.team_name || "Unknown Team"}
                    team1Logo={match?.team1?.team_logo || "/default-logo.png"}
                    team2={match?.team2?.team_name || "Unknown Team"}
                    team2Logo={match?.team2?.team_logo || "/default-logo.png"}
                    team1Score={match?.team1_score ?? "?"}
                    team2Score={match?.team2_score ?? "?"}
                    status={match?.status || "Unknown"}
                    description={match?.description || "No description available."}
                    onDelete={() => handleDeleteMatch(match._id)} // Pass delete function
                  />
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No matches available.</p>
            )}
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default MatchSection;
