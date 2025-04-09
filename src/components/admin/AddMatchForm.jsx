import { useState } from "react";
import {
  PlusCircle,
  XCircle,
  Users,
  Trophy,
  ListTodo,
  MessageCircleMore,
  Goal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddMatchForm = ({ teams, onMatchAdded }) => {
  const [newMatch, setNewMatch] = useState({
    team1: "",
    team2: "",
    team1_score: "",
    team2_score: "",
    team1_scorers: [],
    team2_scorers: [],
    status: "Upcoming",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const getPlayers = (teamId) => {
    return teams.find((t) => t._id === teamId)?.players || [];
  };

  const handleScorerChange = (team, index, field, value) => {
    const scorers = [...newMatch[team]];
    scorers[index] = {
      ...scorers[index],
      [field]: value,
    };
    setNewMatch({ ...newMatch, [team]: scorers });
  };

  const addScorerRow = (team) => {
    setNewMatch({
      ...newMatch,
      [team]: [...newMatch[team], { playerId: "", goals: 1 }],
    });
  };

  const removeScorerRow = (team, index) => {
    const updated = [...newMatch[team]];
    updated.splice(index, 1);
    setNewMatch({ ...newMatch, [team]: updated });
  };

  async function handleAddMatch(e) {
    e.preventDefault();
    if (loading) return;

    if (!newMatch.team1 || !newMatch.team2) {
      alert("Please select both teams.");
      return;
    }
    if (newMatch.team1 === newMatch.team2) {
      alert("A team cannot play against itself.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMatch),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add match");
      }

      onMatchAdded?.(result.match);
      alert("✅ Match added successfully!");
      setNewMatch({
        team1: "",
        team2: "",
        team1_score: "",
        team2_score: "",
        team1_scorers: [],
        team2_scorers: [],
        status: "Upcoming",
        description: "",
      });
    } catch (err) {
      console.error("Error adding match:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const InputWrapper = ({ icon: Icon, children }) => (
    <div className="flex items-center border rounded-lg p-2 bg-white gap-2">
      <Icon className="text-gray-400 w-5 h-5" />
      {children}
    </div>
  );

  return (
    <form className="p-4 bg-white shadow-md rounded-2xl border border-gray-200 w-full max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Match</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputWrapper icon={Users}>
          <Select
            value={newMatch.team1}
            onValueChange={(value) =>
              setNewMatch({ ...newMatch, team1: value, team1_scorers: [] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Team 1" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team._id} value={team._id}>
                  {team.team_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputWrapper>

        <InputWrapper icon={Users}>
          <Select
            value={newMatch.team2}
            onValueChange={(value) =>
              setNewMatch({ ...newMatch, team2: value, team2_scorers: [] })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Team 2" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team._id} value={team._id}>
                  {team.team_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputWrapper>

        <InputWrapper icon={Trophy}>
          <input
            type="number"
            placeholder="Team 1 Score"
            value={newMatch.team1_score}
            onChange={(e) =>
              setNewMatch({ ...newMatch, team1_score: e.target.value })
            }
            className="w-full outline-none text-gray-700"
          />
        </InputWrapper>

        <InputWrapper icon={Trophy}>
          <input
            type="number"
            placeholder="Team 2 Score"
            value={newMatch.team2_score}
            onChange={(e) =>
              setNewMatch({ ...newMatch, team2_score: e.target.value })
            }
            className="w-full outline-none text-gray-700"
          />
        </InputWrapper>
      </div>

      <div className="mt-4">
        <InputWrapper icon={ListTodo}>
          <Select
            value={newMatch.status}
            onValueChange={(value) =>
              setNewMatch({ ...newMatch, status: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </InputWrapper>
      </div>

      <div className="mt-4">
        <InputWrapper icon={MessageCircleMore}>
          <input
            type="text"
            placeholder="Description"
            value={newMatch.description}
            onChange={(e) =>
              setNewMatch({ ...newMatch, description: e.target.value })
            }
            className="w-full outline-none text-gray-700"
          />
        </InputWrapper>
      </div>

      {["team1", "team2"].map((teamKey) => (
        newMatch[teamKey] && (
          <div className="mt-6" key={teamKey}>
            <h3 className="font-semibold text-gray-700 mb-2">
              {teamKey === "team1" ? "Team 1" : "Team 2"} Goal Scorers
            </h3>
            {newMatch[`${teamKey}_scorers`].map((scorer, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <InputWrapper icon={Goal}>
                  <Select
                    value={scorer.playerId}
                    onValueChange={(value) =>
                      handleScorerChange(
                        `${teamKey}_scorers`,
                        index,
                        "playerId",
                        value
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Player" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPlayers(newMatch[teamKey]).map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </InputWrapper>
                <input
                  type="number"
                  min="1"
                  value={scorer.goals}
                  className="w-20 border rounded-lg p-2 text-gray-700"
                  onChange={(e) =>
                    handleScorerChange(
                      `${teamKey}_scorers`,
                      index,
                      "goals",
                      parseInt(e.target.value) || 1
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => removeScorerRow(`${teamKey}_scorers`, index)}
                >
                  <XCircle className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addScorerRow(`${teamKey}_scorers`)}
              className="text-sm text-blue-600 mt-1"
            >
              + Add Scorer
            </button>
          </div>
        )
      ))}

      <button
        type="button"
        onClick={handleAddMatch}
        disabled={loading}
        className={`mt-6 w-full ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        } text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all`}
      >
        {loading ? "Adding..." : (
          <>
            <PlusCircle className="w-5 h-5" /> Add Match
          </>
        )}
      </button>
    </form>
  );
};

export default AddMatchForm;