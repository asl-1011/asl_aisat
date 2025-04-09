import { useState } from "react";
import { Trash2 } from "lucide-react";

const MatchCard = ({
  team1 = "Unknown Team",
  team2 = "Unknown Team",
  team1Logo = "",
  team2Logo = "",
  team1Score = null,
  team2Score = null,
  status = "Upcoming",
  description = "Match details not available.",
  onDelete,
}) => {
  const [team1ImageError, setTeam1ImageError] = useState(false);
  const [team2ImageError, setTeam2ImageError] = useState(false);

  const statusColors = {
    LIVE: "text-red-600 font-bold animate-pulse",
    Upcoming: "text-blue-600 font-semibold",
    Finished: "text-gray-600 font-medium",
  };

  const renderTeamLogo = (error, teamName, logoSrc, onError) =>
    !error ? (
      <img
        src={`/api/teams/logo/${logoSrc}`}
        alt={`${teamName} logo`}
        className="w-14 h-14 object-cover rounded-full border-2 border-gray-300"
        onError={onError}
      />
    ) : (
      <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-bold border-2 border-gray-400">
        {teamName.charAt(0)}
      </div>
    );

  return (
    <div
      className="relative p-4 border border-gray-200 rounded-2xl bg-gradient-to-r from-white to-purple-50 
                 shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 
                 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
    >
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

      {/* Teams Display */}
      <div className="flex items-center justify-between">
        {/* Team 1 */}
        <div className="flex flex-col items-center">
          {renderTeamLogo(team1ImageError, team1, team1Logo, () =>
            setTeam1ImageError(true)
          )}
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">
            {team1}
          </span>
        </div>

        {/* Score + Status */}
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

        {/* Team 2 */}
        <div className="flex flex-col items-center">
          {renderTeamLogo(team2ImageError, team2, team2Logo, () =>
            setTeam2ImageError(true)
          )}
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
