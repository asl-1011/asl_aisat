import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const PlayersSection = ({ profileData, expandedPlayer, setExpandedPlayer }) => {
  return (
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
                <img
                  className="w-16 h-16 rounded-full"
                  src={player.profilePic || "/default-profile.png"}
                  alt={player.name || "Player"}
                />
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
  );
};

export default PlayersSection;
