import { useState } from "react";
import { PlusCircle } from "lucide-react";

const AddMatchForm = ({ teams, onMatchAdded }) => {
  const [newMatch, setNewMatch] = useState({
    team1: "",
    team2: "",
    team1_score: "",
    team2_score: "",
    status: "Upcoming",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleAddMatch(e) {
    e.preventDefault(); // ⬅️ Prevent form submission default behavior

    if (loading) return; // ⬅️ Prevent duplicate clicks

    if (!newMatch.team1 || !newMatch.team2) {
      alert("Please select both teams.");
      return;
    }
    if (newMatch.team1 === newMatch.team2) {
      alert("A team cannot play against itself.");
      return;
    }

    try {
      setLoading(true); // ⬅️ Prevent multiple clicks while loading
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
      setNewMatch({ team1: "", team2: "", team1_score: "", team2_score: "", status: "Upcoming", description: "" });
      alert("✅ Match added successfully!");
    } catch (err) {
      console.error("Error adding match:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="p-4 bg-white shadow-md rounded-xl border border-gray-200 w-full max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Add New Match</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={newMatch.team1} onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })} className="border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-400 bg-white">
          <option value="">Select Team 1</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>{team.team_name}</option>
          ))}
        </select>

        <select value={newMatch.team2} onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })} className="border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-400 bg-white">
          <option value="">Select Team 2</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>{team.team_name}</option>
          ))}
        </select>

        <input type="number" placeholder="Team 1 Score" value={newMatch.team1_score} onChange={(e) => setNewMatch({ ...newMatch, team1_score: e.target.value })} className="border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-400 bg-white" />
        <input type="number" placeholder="Team 2 Score" value={newMatch.team2_score} onChange={(e) => setNewMatch({ ...newMatch, team2_score: e.target.value })} className="border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-400 bg-white" />
      </div>

      <div className="mt-3">
        <select value={newMatch.status} onChange={(e) => setNewMatch({ ...newMatch, status: e.target.value })} className="w-full border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-400 bg-white">
          <option value="Upcoming">Upcoming</option>
          <option value="Finished">Finished</option>
        </select>
      </div>

      <div className="mt-3">
        <input type="text" placeholder="Description" value={newMatch.description} onChange={(e) => setNewMatch({ ...newMatch, description: e.target.value })} className="w-full border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-purple-400 bg-white" />
      </div>

      <button 
        type="button" // ⬅️ Fix: Prevents implicit form submission
        onClick={handleAddMatch} 
        disabled={loading} 
        className={`mt-4 w-full ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"} text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all`}>
        {loading ? "Adding..." : <><PlusCircle className="w-5 h-5 mr-2" /> Add Match</>}
      </button>
    </form>
  );
};

export default AddMatchForm;
