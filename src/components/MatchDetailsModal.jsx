import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import { FaFutbol, FaSquareFull } from "react-icons/fa";
import confetti from "canvas-confetti";

// Get initials from a name
const getInitials = (name) => {
  return name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

// Reusable Placeholder Avatar
const PlaceholderAvatar = ({ name, size = 40 }) => (
  <div
    className="rounded-full bg-gray-400 flex items-center justify-center text-sm font-bold text-white"
    style={{ width: size, height: size }}
  >
    {getInitials(name)}
  </div>
);

const MatchDetailsModal = ({ matchId, isOpen, onClose }) => {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      const res = await fetch(`/api/admin/matches?matchId=${matchId}`);
      const data = await res.json();
      setMatch(data);
    };

    fetchMatch();
  }, [matchId]);

  useEffect(() => {
    if (match && isOpen && match.status === "Finished") {
      if (match.team1_score !== match.team2_score) {
        const duration = 2000;
        const animationEnd = Date.now() + duration;

        const interval = setInterval(() => {
          if (Date.now() > animationEnd) {
            clearInterval(interval);
            return;
          }

          confetti({
            particleCount: 60,
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: {
              x: Math.random(),
              y: Math.random() * 0.6,
            },
          });
        }, 250);
      }
    }
  }, [match, isOpen]);

  if (!match) return null;

  const winner =
    match.team1_score > match.team2_score
      ? match.team1?.team_name
      : match.team2_score > match.team1_score
      ? match.team2?.team_name
      : null;

  const teamsWithPlayers = [
    {
      team: match?.team1,
      players: match?.team1_players || [],
    },
    {
      team: match?.team2,
      players: match?.team2_players || [],
    },
  ];

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold text-center mb-6">
            Match Summary
          </Dialog.Title>

          {/* Teams and Score */}
          <div className="flex justify-between items-center mb-8">
            {/* Team 1 */}
            <div className="flex flex-col items-center">
              {match.team1?.team_logo ? (
                <Image
                  src={`/api/teams/logo/${match.team1.team_logo}`}
                  alt="Team 1"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <PlaceholderAvatar name={match.team1?.team_name} size={64} />
              )}
              <p className="mt-2 text-lg font-semibold text-center">
                {match.team1?.team_name}
              </p>
            </div>

            {/* Score and Winner */}
            <div className="text-center">
              <p className="text-4xl font-bold">
                {match.team1_score} - {match.team2_score}
              </p>
              <p className="text-sm text-gray-500">{match.status}</p>
              {winner && (
                <div className="mt-4 flex justify-center">
                  <div className="relative px-6 py-2 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 shadow-md">
                    <span className="relative z-10 text-white text-base font-semibold tracking-wide animate-[pulse_2s_ease-in-out_infinite]">
                      {winner} has won the match!
                    </span>
                    <div className="absolute inset-0 rounded-full bg-white/10 blur-sm animate-[ping_3s_linear_infinite]" />
                  </div>
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-center">
              {match.team2?.team_logo ? (
                <Image
                  src={`/api/teams/logo/${match.team2.team_logo}`}
                  alt="Team 2"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <PlaceholderAvatar name={match.team2?.team_name} size={64} />
              )}
              <p className="mt-2 text-lg font-semibold text-center">
                {match.team2?.team_name}
              </p>
            </div>
          </div>

          {/* Players Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamsWithPlayers.map(({ team, players }, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold mb-2 text-center">
                  {team?.team_name}
                </h3>

                {players.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center">
                    No players available
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {players.map((player) => (
                      <li
                        key={player._id}
                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg shadow-sm"
                      >
                        {player.profilePic ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={`/api/teams/logo/${player.profilePic}`}
                              alt={player.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <PlaceholderAvatar name={player.name} size={48} />
                        )}

                        <div className="flex-1">
                          <p className="text-sm font-medium">{player.name}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {player.goals > 0 && (
                            <FaFutbol
                              className="text-green-600"
                              title={`${player.goals} Goals`}
                            />
                          )}
                          {player.yellow_card && (
                            <FaSquareFull
                              className="text-yellow-400"
                              title="Yellow Card"
                            />
                          )}
                          {player.red_card && (
                            <FaSquareFull
                              className="text-red-600"
                              title="Red Card"
                            />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MatchDetailsModal;
