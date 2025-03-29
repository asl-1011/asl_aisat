import { useState, useEffect } from "react";

const MatchCard = ({
  team1 = "Unknown Team",
  team2 = "Unknown Team",
  team1Logo = "/default-logo.png",
  team2Logo = "/default-logo.png",
  team1Score,
  team2Score,
  status = "Upcoming",
  description = "Match details not available.",
  poll = { votes1: 0, votes2: 0 }, // Poll data (votes)
  onVote, // Function to handle voting
}) => {
  const [votes1, setVotes1] = useState(poll.votes1);
  const [votes2, setVotes2] = useState(poll.votes2);
  const [voted, setVoted] = useState(false); // Prevents multiple votes

  useEffect(() => {
    setVotes1(poll.votes1);
    setVotes2(poll.votes2);
  }, [poll]);

  const totalVotes = votes1 + votes2;
  const percent1 = totalVotes > 0 ? ((votes1 / totalVotes) * 100).toFixed(1) : 50;
  const percent2 = totalVotes > 0 ? ((votes2 / totalVotes) * 100).toFixed(1) : 50;

  const handleVote = (voteType) => {
    if (voted) return; // Restrict multiple votes
    if (onVote) {
      onVote(voteType); // Call API function
    }
    if (voteType === "votes1") setVotes1(votes1 + 1);
    if (voteType === "votes2") setVotes2(votes2 + 1);
    setVoted(true);
  };

  const statusColors = {
    LIVE: "text-red-600 font-bold animate-pulse",
    Upcoming: "text-blue-600 font-semibold",
    Finished: "text-gray-600 font-medium",
  };

  return (
    <div
      className="p-5 border border-gray-200 rounded-2xl bg-gradient-to-br from-white to-purple-100 
                 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] sm:hover:scale-100 cursor-pointer"
    >
      {/* Team Logos & Names */}
      <div className="flex items-center justify-between">
        {/* Left Team */}
        <div className="flex flex-col items-center">
          <img
            src={team1Logo}
            alt={`${team1} logo`}
            className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
            onError={(e) => (e.target.src = "/default-logo.png")}
          />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">
            {team1}
          </span>
        </div>

        {/* Score & Status */}
        <div className="flex flex-col items-center">
          {status !== "Upcoming" && (
            <span className="text-2xl font-bold text-gray-800">
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
            src={team2Logo}
            alt={`${team2} logo`}
            className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
            onError={(e) => (e.target.src = "/default-logo.png")}
          />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">
            {team2}
          </span>
        </div>
      </div>

      {/* Match Description */}
      <p className="text-center text-sm text-gray-600 mt-3">{description}</p>

      {/* Poll Section */}
      <div className="mt-4">
        <div className="flex justify-between items-center">
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 
            ${
              voted
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md hover:shadow-lg hover:from-purple-600 hover:to-purple-800"
            }`}
            onClick={() => handleVote("votes1")}
            disabled={voted}
          >
            Vote {team1}
          </button>

          <span className="text-sm font-semibold text-gray-700">Votes: {votes1} ({percent1}%)</span>
        </div>

        {/* Vote Bar for Team 1 */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full mt-2">
          <div
            className="absolute left-0 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
            style={{ width: `${percent1}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 
            ${
              voted
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-pink-700 text-white shadow-md hover:shadow-lg hover:from-pink-600 hover:to-pink-800"
            }`}
            onClick={() => handleVote("votes2")}
            disabled={voted}
          >
            Vote {team2}
          </button>

          <span className="text-sm font-semibold text-gray-700">Votes: {votes2} ({percent2}%)</span>
        </div>

        {/* Vote Bar for Team 2 */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full mt-2">
          <div
            className="absolute left-0 h-3 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
            style={{ width: `${percent2}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
