"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, Edit, PlusCircle, X } from "lucide-react";
import Navbar from "@components/admin/navbar.jsx";

export default function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlayerListModal, setShowPlayerListModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamLogo, setTeamLogo] = useState(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  const initialTeamState = {
    team_name: "",
    manager: "",
    team_logo: "",
    players: [],
  };
  const [newTeam, setNewTeam] = useState(initialTeamState);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
    team: "",
    photo: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, playersRes] = await Promise.all([
          fetch("/api/teams"),
          fetch("/api/players"),
        ]);

        if (!teamsRes.ok || !playersRes.ok)
          throw new Error("Failed to fetch data");

        setTeams(await teamsRes.json());
        setPlayers(await playersRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openEditModal = (team) => {
    setSelectedTeam(team);
    setSelectedPlayers(team?.players || []);
    setTeamLogo(null);
    setShowEditModal(true);
  };

  const openNewTeamModal = () => {
    setNewTeam(initialTeamState);
    setSelectedPlayers([]);
    setSelectedTeam(null);
    setTeamLogo(null);
    setShowEditModal(true);
  };

  const openAddPlayerModal = () => {
    setNewPlayer({ name: "", position: "", team: "", photo: null });
    setShowAddPlayerModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setShowAddPlayerModal(false);
    setShowPlayerListModal(false);
    setSelectedTeam(null);
    setSelectedPlayers([]);
    setNewTeam(initialTeamState);
    setTeamLogo(null);
  };

  const handleSaveTeam = async () => {
    const formData = new FormData();
    formData.append("team_name", newTeam.team_name);
    formData.append("manager", newTeam.manager);
    formData.append("players", JSON.stringify(selectedPlayers));

    if (teamLogo) {
      formData.append("team_logo", teamLogo);
    }

    try {
      const url = selectedTeam
        ? `/api/admin/teams/${selectedTeam._id}`
        : "/api/admin/teams";
      const method = selectedTeam ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok)
        throw new Error(`Failed to ${selectedTeam ? "update" : "add"} team`);

      const data = await res.json();
      setTeams(
        selectedTeam
          ? teams.map((t) => (t._id === selectedTeam._id ? data : t))
          : [...teams, data]
      );

      closeModal();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE" });
      setTeams(teams.filter((t) => t._id !== teamId));
    } catch (err) {
      console.error("Error deleting team:", err);
    }
  };

  const handleAddPlayer = async () => {
    const formData = new FormData();
    formData.append("name", newPlayer.name);
    formData.append("position", newPlayer.position);
    formData.append("team", newPlayer.team);

    if (newPlayer.photo) {
      formData.append("profilePic", newPlayer.photo);
    }

    try {
      const res = await fetch("/api/admin/addplayer", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add player");

      const data = await res.json();
      setPlayers([...players, data]);

      closeModal();
    } catch (err) {
      console.error("Error adding player:", err);
    }
  };

  if (loading)
    return (
      <div className="text-center text-white text-xl p-10">
        Loading teams...
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 p-10">Error: {error}</div>;

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-purple-700 to-pink-500 text-white pb-20">
      <div className="p-6">
        <h1 className="text-4xl font-extrabold text-center mb-8 drop-shadow-lg">
          Admin Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={openNewTeamModal}
            className="flex items-center gap-2 bg-white text-purple-700 px-5 py-3 rounded-lg shadow-lg hover:bg-purple-100 transition-all"
          >
            <PlusCircle size={20} /> Add Team
          </button>
          <button
            onClick={openAddPlayerModal}
            className="flex items-center gap-2 bg-white text-purple-700 px-5 py-3 rounded-lg shadow-lg hover:bg-purple-100 transition-all"
          >
            <PlusCircle size={20} /> Add Player
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {teams.map((team) => (
            <motion.div
              key={team._id}
              className="p-5 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={team.team_logo ? `/api/teams/logo/${team.team_logo}` : "/default-logo.png"}
                  alt={team.team_name}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-white"
                />
                <div>
                  <h2 className="text-lg font-semibold">{team.team_name}</h2>
                  <p className="text-sm text-gray-300">Manager: {team.manager}</p>
                </div>
                <button onClick={() => openEditModal(team)} className="text-blue-300 hover:text-blue-500">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDeleteTeam(team._id)} className="text-red-300 hover:text-red-500">
                  <Trash size={18} />
                </button>
              </div>

              <div className="mt-3">
                <h3 className="text-white text-sm font-semibold">Players:</h3>
                <button
                  onClick={() => {
                    setSelectedTeam(team);
                    setSelectedPlayers(team.players);
                    setShowPlayerListModal(true);
                  }}
                  className="mt-2 text-blue-200 hover:underline text-sm"
                >
                  View Players ({team.players.length})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div className="relative bg-white text-black p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-5 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-3">
                {selectedTeam ? "Edit Team" : "Add New Team"}
              </h2>

              <input
                type="text"
                placeholder="Team Name"
                value={newTeam.team_name}
                onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
                className="mt-3 w-full p-2 border rounded-md"
              />

              <input
                type="text"
                placeholder="Manager Name"
                value={newTeam.manager}
                onChange={(e) => setNewTeam({ ...newTeam, manager: e.target.value })}
                className="mt-3 w-full p-2 border rounded-md"
              />

              <div className="mt-4">
                {teamLogo && (
                  <Image
                    src={URL.createObjectURL(teamLogo)}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="mb-2 rounded-full border"
                  />
                )}
                <label className="block w-full px-4 py-2 bg-purple-100 text-purple-800 rounded-lg cursor-pointer hover:bg-purple-200 transition">
                  Upload Team Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTeamLogo(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleSaveTeam}
                className="mt-4 w-full bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-900 transition-all"
              >
                {selectedTeam ? "Update Team" : "Add Team"}
              </button>
            </motion.div>
          </motion.div>
        )}

        {showPlayerListModal && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <motion.div className="bg-white text-black p-6 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Players</h2>
                <button onClick={() => setShowPlayerListModal(false)} className="text-gray-500 hover:text-gray-800">
                  <X size={24} />
                </button>
              </div>
              <ul className="list-disc pl-4 text-sm">
                {selectedPlayers.map((player) => (
                  <li key={player._id} className="mb-1">
                    {player.name} - {player.position}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}

        {showAddPlayerModal && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div className="relative bg-white text-black p-6 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-5 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-3">Add New Player</h2>

              <input
                type="text"
                placeholder="Player Name"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                className="mt-3 w-full p-2 border rounded-md"
              />

              <input
                type="text"
                placeholder="Position"
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                className="mt-3 w-full p-2 border rounded-md"
              />

              <select
                value={newPlayer.team}
                onChange={(e) => setNewPlayer({ ...newPlayer, team: e.target.value })}
                className="mt-3 w-full p-2 border rounded-md"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.team_name}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPlayer({ ...newPlayer, photo: e.target.files[0] })}
                className="mt-3 w-full p-2 border rounded-md"
              />

              <button
                onClick={handleAddPlayer}
                className="mt-4 w-full bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-900 transition-all"
              >
                Add Player
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full bg-white text-black shadow-md border-t">
        <Navbar />
      </div>
    </div>
  );
}
