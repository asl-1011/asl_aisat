import { useState, useEffect } from "react";
import Image from "next/image";

const MatchCard = ({
  team1 = "Unknown Team",
  team2 = "Unknown Team",
  team1Logo = "/default-logo.png",
  team2Logo = "/default-logo.png",
  team1Score = null,
  team2Score = null,
  status = "Upcoming",
  description = "Match details not available.",
  poll = { votes1: 0, votes2: 0 },
  onVote = () => Promise.resolve(),
  onClick = () => {},
}) => {
  const [votes1, setVotes1] = useState(poll.votes1 || 0);
  const [votes2, setVotes2] = useState(poll.votes2 || 0);
  const [voted, setVoted] = useState(false);

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
      await onVote(voteType);
      if (voteType === "votes1") setVotes1((prev) => prev + 1);
      else setVotes2((prev) => prev + 1);
    } catch (error) {
      console.error("Voting error:", error);
      setVoted(false);
    }
  };

  return (
    <div
      className="p-5 border border-gray-200 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <Image src={`/api/teams/logo/${team1Logo}`} alt={team1} width={50} height={50} className="rounded-full" />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">{team1}</span>
        </div>

        <div className="flex flex-col items-center">
          {status !== "Upcoming" && (
            <span className="text-2xl font-bold text-gray-800">{team1Score} - {team2Score}</span>
          )}
          <span className="text-sm text-gray-600">{status}</span>
        </div>

        <div className="flex flex-col items-center">
          <Image src={`/api/teams/logo/${team2Logo}`} alt={team2} width={50} height={50} className="rounded-full" />
          <span className="font-semibold text-gray-700 text-sm text-center mt-2">{team2}</span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-600 mt-3">{description}</p>
    </div>
  );
};

export default MatchCard;
