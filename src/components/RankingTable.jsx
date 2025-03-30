import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";

const RankingTable = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch("/api/rankings"); // Replace with actual API
        if (!response.ok) {
          throw new Error("Failed to fetch rankings");
        }
        const data = await response.json();

        // Sort teams by points in descending order
        const sortedData = data.sort((a, b) => b.points - a.points);
        setRankings(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  return (
    <section className="bg-white rounded-xl border shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 w-full max-w-4xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mr-2 sm:mr-3" />
        Rankings
      </h2>

      {loading ? (
        <p className="text-gray-500 text-center text-base sm:text-lg">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center text-base sm:text-lg">{error}</p>
      ) : (
        <div className="overflow-x-auto sm:overflow-visible">
          <table className="w-full text-sm sm:text-base border-collapse">
            <thead className="bg-gray-50 text-gray-800">
              <tr className="border-b">
                <th className="px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold w-[40%]">Team</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold w-[12%]">W</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold w-[12%]">D</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold w-[12%]">L</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center font-semibold w-[12%]">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((team, index) => {
                const totalTeams = rankings.length;
                const topThreshold = Math.ceil(totalTeams * 0.7); // 70% of teams
                const midThreshold = Math.ceil(totalTeams * 0.3); // Remaining 30%

                let bgColor = "bg-red-200 text-red-800"; // Default for bottom 30%
                if (index < topThreshold) {
                  bgColor = "bg-green-200 text-green-800"; // Top 70%
                } else if (index < topThreshold + midThreshold) {
                  bgColor = "bg-yellow-200 text-yellow-800"; // Middle 30%
                }

                return (
                  <tr key={team.team_id} className="hover:bg-gray-100 border-b">
                    <td className="px-3 sm:px-5 py-2 sm:py-3 flex items-center">
                      <img
                        src={team.team_logo}
                        alt={`${team.team_name} logo`}
                        className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3"
                      />
                      <span className="font-medium text-gray-900 truncate">{team.team_name}</span>
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700">{team.wins}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700">{team.draws}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700">{team.losses}</td>
                    <td className="px-2 sm:px-3 py-2 sm:py-3 text-center">
                      <span className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${bgColor}`}>
                        {team.points}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default RankingTable;
