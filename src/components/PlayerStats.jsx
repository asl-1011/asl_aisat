import { motion } from "framer-motion";
import { Trophy, Goal, Timer } from "lucide-react";

const PlayerStats = ({ name, position, goals, assists, matches, image }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="bg-white p-4 rounded-lg border shadow-sm"
    >
      <div className="flex items-center space-x-4">
        <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{position}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Goal className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-600">{goals} goals</span>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-600">{assists} assists</span>
        </div>
        <div className="flex items-center space-x-2">
          <Timer className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">{matches} matches</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerStats;
