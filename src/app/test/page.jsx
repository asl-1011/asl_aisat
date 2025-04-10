import { Card, CardContent } from "@/components/ui/card";
import { Goal, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";

// Mock data (replace with real fetch)
const match = {
  team1: {
    team_name: "Kerala Blasters",
    team_logo: "67f689da2310b5e2183ddf61",
  },
  team2: {
    team_name: "Bengaluru FC",
    team_logo: "67ed54b1df2bf20a6546e061",
  },
  team1_score: 1,
  team2_score: 0,
  team1_players: [
    {
      _id: "1",
      name: "Adrian Luna",
      profilePic: "67f5f9b444d7b6eceb7ff805",
      goals: 1,
      yellow_card: false,
      red_card: false,
      hasEvent: true,
    },
    {
      _id: "2",
      name: "Noah Sadaoui",
      profilePic: "67f5fbdb7e1bada449580d31",
      goals: 0,
      yellow_card: false,
      red_card: false,
      hasEvent: false,
    },
  ],
  team2_players: [],
};

const MatchPage = () => {
  const { team1, team2, team1_score, team2_score, team1_players, team2_players } = match;

  const renderPlayerRow = (player) => (
    <tr key={player._id} className="border-b">
      <td className="flex items-center gap-2 py-2">
        <Image
          src={`/uploads/${player.profilePic}`}
          alt={player.name}
          width={32}
          height={32}
          className="rounded-full"
        />
        <span>{player.name}</span>
      </td>
      <td className="text-center">
        {player.goals > 0 && <Goal className="text-green-600 inline-block" size={16} />}
      </td>
      <td className="text-center">
        {player.yellow_card && <ShieldAlert className="text-yellow-500 inline-block" size={16} />}
      </td>
      <td className="text-center">
        {player.red_card && <ShieldCheck className="text-red-600 inline-block" size={16} />}
      </td>
    </tr>
  );

  return (
    <div className="p-4">
      <Card className="w-full p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Image
              src={`/uploads/${team1.team_logo}`}
              alt={team1.team_name}
              width={40}
              height={40}
            />
            <span className="font-semibold">{team1.team_name}</span>
          </div>
          <div className="text-2xl font-bold">
            {team1_score} - {team2_score}
          </div>
          <div className="flex items-center gap-2">
            <Image
              src={`/uploads/${team2.team_logo}`}
              alt={team2.team_name}
              width={40}
              height={40}
            />
            <span className="font-semibold">{team2.team_name}</span>
          </div>
        </div>

        {/* Player Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team 1 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{team1.team_name} Players</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Player</th>
                    <th className="text-center">⚽</th>
                    <th className="text-center">🟨</th>
                    <th className="text-center">🟥</th>
                  </tr>
                </thead>
                <tbody>{team1_players.map(renderPlayerRow)}</tbody>
              </table>
            </CardContent>
          </Card>

          {/* Team 2 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{team2.team_name} Players</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Player</th>
                    <th className="text-center">⚽</th>
                    <th className="text-center">🟨</th>
                    <th className="text-center">🟥</th>
                  </tr>
                </thead>
                <tbody>{team2_players.map(renderPlayerRow)}</tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default MatchPage;
