import { Trash2 } from "lucide-react";

const MatchCard = ({
  team1 = "Unknown Team",
  team2 = "Unknown Team",
  team1Logo = "/default-logo.png",
  team2Logo = "/default-logo.png",
  team1Score = null,
  team2Score = null,
  status = "Upcoming",
  description = "Match details not available.",
  onDelete,
}) => {
  const statusColors = {
    LIVE: "text-red-600 font-bold animate-pulse",
    Upcoming: "text-blue-600 font-semibold",
    Finished: "text-gray-600 font-medium",
  };

  return (
    <div
      className="relative p-4 border border-gray-200 rounded-2xl bg-gradient-to-r from-white to-purple-50 
                 shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 
                 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
    >
      {/* Delete Icon */}
      {onDelete && (
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this match?")) {
              onDelete();
            }
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 size={20} />
        </button>
      )}

      {/* Team Logos & Names */}
      <div className="flex items-center justify-between">
        {/* Left Team */}
        <div className="flex flex-col items-center">
          <img
            src={`/api/teams/logo/${team1Logo}`}
          
            alt={`${team1} logo`}
            className="w-14 h-14 object-cover rounded-full border-2 border-gray-300"
            onError={(e) => (e.target.src = "/default-logo.png")}
          />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">
            {team1}
          </span>
        </div>

        {/* Score & Status */}
        <div className="flex flex-col items-center">
          {status !== "Upcoming" && (
            <span className="text-lg font-bold text-gray-800">
              {typeof team1Score === "number" && typeof team2Score === "number"
                ? `${team1Score} - ${team2Score}`
                : "? - ?"}
            </span>
          )}
          <span className={`text-sm ${statusColors[status] || "text-gray-600"}`}>
            {status}
          </span>
        </div>

        {/* Right Team */}
        <div className="flex flex-col items-center">
          <img
            src={`/api/teams/logo/${team2Logo}`}
            alt={`${team2} logo`}
            className="w-14 h-14 object-cover rounded-full border-2 border-gray-300"
            onError={(e) => (e.target.src = "/default-logo.png")}
          />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">
            {team2}
          </span>
        </div>
      </div>

      {/* Match Description */}
      <p className="text-center text-sm text-gray-600 mt-2">{description}</p>
    </div>
  );
};

export default MatchCard;