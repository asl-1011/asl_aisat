import React from "react";

const MatchCard = ({ team1, team2, team1Logo, team2Logo, score, status, description, onClick }) => {
  // Define colors based on status
  const statusColors = {
    "LIVE": "text-red-600 font-bold animate-pulse",
    "Upcoming": "text-blue-600 font-semibold",
    "Final": "text-gray-600 font-medium",
  };

  return (
    <div
      className="p-4 border border-gray-200 rounded-2xl bg-gradient-to-r from-white to-purple-50 
                 shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 
                 transition-all hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      {/* Team Logos & Names */}
      <div className="flex items-center justify-between">
        {/* Left Team */}
        <div className="flex flex-col items-center">
          <img src={team1Logo} alt={`${team1} logo`} className="w-14 h-14 object-cover rounded-full border-2 border-gray-300" />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">{team1}</span>
        </div>

        {/* VS Text */}
        <span className="text-lg font-bold text-gray-800">VS</span>

        {/* Right Team */}
        <div className="flex flex-col items-center">
          <img src={team2Logo} alt={`${team2} logo`} className="w-14 h-14 object-cover rounded-full border-2 border-gray-300" />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">{team2}</span>
        </div>
      </div>

      {/* Match Status & Score */}
      <p className={`text-center text-sm ${statusColors[status] || "text-gray-600"}`}>
        {status === "Final" ? `Final Score: ${score}` : ` ${description}`}
      </p>
    </div>
  );
};

export default MatchCard;
