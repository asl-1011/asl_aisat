import { useState, useMemo } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { Timer } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically load MatchCard to avoid SSR issues
const MatchCard = dynamic(() => import("./MatchCard"), { ssr: false });

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const matchVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: easeInOut } },
};

const CATEGORIES = ["all", "recent", "upcoming"];

const MatchSection = ({ matchData = [] }) => {
  const [category, setCategory] = useState("all");

  // Function to handle voting
  const handleVote = async (matchId, voteType) => {
    console.log("🟡 handleVote triggered with:", { matchId, voteType });

    if (!matchId) {
      console.error("❌ Invalid match ID", matchId);
      return;
    }

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, vote: voteType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Voting failed");

      console.log("✅ Vote successful:", data);
    } catch (error) {
      console.error("❌ Vote error:", error);
    }
  };

  // Memoized filtering for optimized rendering
  const filteredMatches = useMemo(() => {
    if (category === "all") return matchData;
    return matchData.filter((match) =>
      category === "recent" ? match.status === "Finished" : match.status === "Upcoming"
    );
  }, [matchData, category]);

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Timer className="w-5 h-5 text-blue-500 mr-2" /> Matches
      </h2>

      {/* Category Buttons */}
      <div className="flex justify-center space-x-2 sm:space-x-4 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => category !== cat && setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${category === cat ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Matches List */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div key={category} initial="hidden" animate="visible" exit="exit" layout className="space-y-4">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <motion.div key={match?._id} variants={matchVariants} layout>
                <MatchCard
                  team1={match?.team1?.team_name || "Unknown Team"}
                  team1Logo={match?.team1?.team_logo || "/default-logo.png"}
                  team2={match?.team2?.team_name || "Unknown Team"}
                  team2Logo={match?.team2?.team_logo || "/default-logo.png"}
                  team1Score={match?.team1_score ?? "?"}
                  team2Score={match?.team2_score ?? "?"}
                  status={match?.status || "Unknown"}
                  description={match?.description || "No description available."}
                  poll={match?.poll || { votes1: 0, votes2: 0 }}
                  onVote={(voteType) => handleVote(match?._id, voteType)}
                />
              </motion.div>
            ))
          ) : (
            <motion.p variants={matchVariants} className="text-gray-500 text-center py-4">
              No matches available.
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
};

export default MatchSection;
