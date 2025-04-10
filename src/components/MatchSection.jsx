import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "lucide-react";
import dynamic from "next/dynamic";
import MatchDetailsModal from "./MatchDetailsModal";

const MatchCard = dynamic(() => import("./MatchCard"), { ssr: false });

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const matchVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const CATEGORIES = ["all", "recent", "upcoming"];

const MatchSection = ({ matchData = [] }) => {
  const [category, setCategory] = useState("all");
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleVote = async (matchId, voteType) => {
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, vote: voteType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vote failed");
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

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
      className="bg-white rounded-xl border shadow-md p-4"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Timer className="w-5 h-5 text-blue-500 mr-2" /> Matches
      </h2>

      {/* Category Filter */}
      <div className="flex justify-center space-x-2 sm:space-x-4 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              category === cat ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Match List */}
      <AnimatePresence mode="popLayout">
        <motion.div key={category} initial="hidden" animate="visible" exit="exit" layout className="space-y-4">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <motion.div key={match._id} variants={matchVariants} layout>
                <MatchCard
                  team1={match?.team1?.team_name}
                  team2={match?.team2?.team_name}
                  team1Logo={match?.team1?.team_logo}
                  team2Logo={match?.team2?.team_logo}
                  team1Score={match?.team1_score}
                  team2Score={match?.team2_score}
                  status={match?.status}
                  description={match?.description}
                  poll={match?.poll}
                  onVote={(voteType) => handleVote(match._id, voteType)}
                  onClick={() => {
                    setSelectedMatchId(match._id); // ✅ Pass match ID only
                    setShowModal(true);
                  }}
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

      {/* Match Detail Modal */}
      {selectedMatchId && (
        <MatchDetailsModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedMatchId(null);
          }}
          matchId={selectedMatchId}
        />
      )}
    </motion.section>
  );
};

export default MatchSection;
