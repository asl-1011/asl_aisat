"use client";
import { useState } from "react";
import {
  PlusCircle,
  XCircle,
  Users,
  Trophy,
  ListTodo,
  MessageCircleMore,
  AlertTriangle,
  Ban,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

  const addScorer = (teamKey, player) => {
    setNewMatch((prev) => ({
      ...prev,
      [teamKey]: [
        ...prev[teamKey],
        {
          playerId: player._id,
          goals: 1,
          yellow: false,
          red: false,
        },
      ],
    }));
  };

  const updateScorer = (teamKey, index, field, value) => {
    const updated = [...newMatch[teamKey]];
    updated[index][field] = value;
    setNewMatch((prev) => ({ ...prev, [teamKey]: updated }));
  };

  const removeScorer = (teamKey, index) => {
    const updated = [...newMatch[teamKey]];
    updated.splice(index, 1);
    setNewMatch((prev) => ({ ...prev, [teamKey]: updated }));
  };

  const toggleCard = (teamKey, index, cardType) => {
    updateScorer(teamKey, index, cardType, !newMatch[teamKey][index][cardType]);
  };

  const resetForm = () => {
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
  };

  async function handleAddMatch(e) {
    e.preventDefault();
    if (loading) return;

    // Validations
    if (!newMatch.team1 || !newMatch.team2) {
      return alert("Please select both teams.");
    }

    if (newMatch.team1 === newMatch.team2) {
      return alert("A team cannot play against itself.");
    }

    if (newMatch.status === "Finished") {
      const s1 = parseInt(newMatch.team1_score);
      const s2 = parseInt(newMatch.team2_score);

      if (
        isNaN(s1) || isNaN(s2) ||
        s1 < 0 || s2 < 0
      ) {
        return alert("Please enter valid scores.");
      }
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
      resetForm();
    } catch (err) {
      console.error("Error:", err);
      alert(err.message || "Something went wrong.");
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
    <form
      onSubmit={handleAddMatch}
      className="p-4 bg-white shadow-md rounded-2xl border border-gray-200 w-full max-w-xl mx-auto"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Match</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[["team1", "Team 1"], ["team2", "Team 2"]].map(([key, label]) => (
          <InputWrapper key={key} icon={Users}>
            <Select
              value={newMatch[key]}
              onValueChange={(value) =>
                setNewMatch({
                  ...newMatch,
                  [key]: value,
                  [`${key}_scorers`]: [],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${label}`} />
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
        ))}

        {newMatch.status === "Finished" && (
          <>
            <InputWrapper icon={Trophy}>
              <input
                type="number"
                min="0"
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
                min="0"
                placeholder="Team 2 Score"
                value={newMatch.team2_score}
                onChange={(e) =>
                  setNewMatch({ ...newMatch, team2_score: e.target.value })
                }
                className="w-full outline-none text-gray-700"
              />
            </InputWrapper>
          </>
        )}
      </div>

      <div className="mt-4">
        <InputWrapper icon={ListTodo}>
          <Select
            value={newMatch.status}
            onValueChange={(value) =>
              setNewMatch((prev) => ({
                ...prev,
                status: value,
                ...(value === "Upcoming" && {
                  team1_score: "",
                  team2_score: "",
                  team1_scorers: [],
                  team2_scorers: [],
                }),
              }))
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

      {/* Scorers */}
      {newMatch.status === "Finished" &&
        ["team1", "team2"].map((teamKey) => {
          const scorers = newMatch[`${teamKey}_scorers`];
          const teamId = newMatch[teamKey];
          if (!teamId) return null;

          return (
            <div key={teamKey} className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                {teamKey === "team1" ? "Team 1" : "Team 2"} Scorers
              </h3>

              {scorers.map((scorer, index) => {
                const player = getPlayers(teamId).find(
                  (p) => p._id === scorer.playerId
                );
                return (
                  <div key={index} className="flex items-center gap-3 mb-2">
                    <span className="text-gray-700">{player?.name || "Unknown"}</span>
                    <input
                      type="number"
                      min="0"
                      value={scorer.goals}
                      onChange={(e) =>
                        updateScorer(
                          `${teamKey}_scorers`,
                          index,
                          "goals",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20 border rounded-md p-1"
                    />
                    <Badge
                      variant={scorer.yellow ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        toggleCard(`${teamKey}_scorers`, index, "yellow")
                      }
                    >
                      <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                      Yellow
                    </Badge>
                    <Badge
                      variant={scorer.red ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        toggleCard(`${teamKey}_scorers`, index, "red")
                      }
                    >
                      <Ban className="w-4 h-4 mr-1 text-red-500" />
                      Red
                    </Badge>
                    <XCircle
                      className="w-5 h-5 text-red-500 cursor-pointer"
                      onClick={() =>
                        removeScorer(`${teamKey}_scorers`, index)
                      }
                    />
                  </div>
                );
              })}

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-sm text-blue-600 mt-2 underline"
                  >
                    + Add Scorer
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select Player</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {getPlayers(teamId).map((player) => (
                      <button
                        key={player._id}
                        type="button"
                        onClick={() =>
                          addScorer(`${teamKey}_scorers`, player)
                        }
                        className="text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        {player.name}
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          );
        })}

      <button
        type="submit"
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
