import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer } from "lucide-react";
import dynamic from "next/dynamic";

const MatchCard = dynamic(() => import("./MatchCard"), { ssr: false, loading: () => <p>Loading...</p> });

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const matchVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeInOut" } },
};

const MatchSection = ({ matchData }) => {
  const [category, setCategory] = useState("all");

  const filteredMatches = matchData.filter((match) => {
    if (category === "all") return true;
    if (category === "recent") return match.status === "finished";
    if (category === "upcoming") return match.status === "upcoming";
    return false;
  });

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

      <div className="flex justify-center space-x-2 sm:space-x-4 mb-6">
        {["all", "recent", "upcoming"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${category === cat ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={category}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-4"
        >
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <motion.div key={match.id} variants={matchVariants}>
                <MatchCard {...match} />
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
