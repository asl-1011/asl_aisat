import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

const MatchCard = ({
  team1 = "Unknown Team",
  team2 = "Unknown Team",
  team1Logo = "/default-logo.png", // Provide a default fallback image
  team2Logo = "/default-logo.png",
  team1Score = null,
  team2Score = null,
  status = "Upcoming",
  description = "Match details not available.",
  poll = { votes1: 0, votes2: 0 },
  onVote = () => Promise.resolve(),
}) => {
  const [votes1, setVotes1] = useState(poll.votes1 || 0);
  const [votes2, setVotes2] = useState(poll.votes2 || 0);
  const [voted, setVoted] = useState(false);
  const [showPoll, setShowPoll] = useState(false);

  useEffect(() => {
    setVotes1(poll.votes1 || 0);
    setVotes2(poll.votes2 || 0);
  }, [poll]);

  const totalVotes = votes1 + votes2;
  const percent1 = totalVotes > 0 ? ((votes1 / totalVotes) * 100).toFixed(1) : 50;
  const percent2 = totalVotes > 0 ? ((votes2 / totalVotes) * 100).toFixed(1) : 50;

  const handleVote = async (voteType) => {
    if (voted) return;
    setVoted(true);
    try {
      await onVote(voteType); // Ensure the request is successful before updating UI
      if (voteType === "votes1") {
        setVotes1((prev) => prev + 1);
      } else {
        setVotes2((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error during voting process:", error);
      setVoted(false); // Re-enable voting in case of failure
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <Image src={`/api/teams/logo/${team1Logo}`} alt={team1} width={50} height={50} className="rounded-full" />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">{team1}</span>
        </div>

        <div className="flex flex-col items-center">
          {status !== "Upcoming" && <span className="text-2xl font-bold text-gray-800">{team1Score} - {team2Score}</span>}
          <span className="text-sm text-gray-600">{status}</span>
        </div>

        <div className="flex flex-col items-center">
          <Image src={`/api/teams/logo/${team2Logo}`} alt={team2} width={50} height={50} className="rounded-full" />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">{team2}</span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-3">{description}</p>

      <div className="mt-4">
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 rounded-full w-full text-blue-500" onClick={() => setShowPoll(!showPoll)}>
          {showPoll ? "Hide Poll" : <span className="text-gray">Vote Now</span>}
          {showPoll ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showPoll && (
          <div className="mt-3">
            <div className="flex justify-between items-center">
              <button
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  voted ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                onClick={() => handleVote("votes1")}
                disabled={voted}
              >
                Vote {team1}
              </button>
              <span className="text-sm font-semibold text-gray-700">Votes: {votes1} ({percent1}%)</span>
            </div>
            <div className="relative w-full h-3 bg-gray-200 rounded-full mt-2">
              <div className="absolute left-0 h-3 bg-blue-500 rounded-full" style={{ width: `${percent1}%` }}></div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <button
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                  voted ? "bg-gray-400 text-white cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"
                }`}
                onClick={() => handleVote("votes2")}
                disabled={voted}
              >
                Vote {team2}
              </button>
              <span className="text-sm font-semibold text-gray-700">Votes: {votes2} ({percent2}%)</span>
            </div>
            <div className="relative w-full h-3 bg-gray-200 rounded-full mt-2">
              <div className="absolute left-0 h-3 bg-red-500 rounded-full" style={{ width: `${percent2}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
