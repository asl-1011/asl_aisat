"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, Edit, PlusCircle, X } from "lucide-react";
import Navbar from "@components/Navbar.jsx";

export default function AdminDashboard() {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newTeam, setNewTeam] = useState({ team_name: "", manager: "", team_logo: "", players: [] });

    useEffect(() => {
        fetch("/api/teams").then(res => res.json()).then(data => setTeams(data));
        fetch("/api/players").then(res => res.json()).then(data => setPlayers(data));
    }, []);

    const openModal = (team) => {
        setSelectedTeam(team);
        setSelectedPlayers(team?.players || []);
        setShowEditModal(true);
    };

    const closeModal = () => {
        setSelectedTeam(null);
        setSelectedPlayers([]);
        setShowEditModal(false);
    };

    const handleEditTeam = async () => {
        fetch(`/api/admin/teams/${selectedTeam._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...selectedTeam, players: selectedPlayers }),
        }).then(() => {
            setTeams(teams.map(t => t._id === selectedTeam._id ? { ...selectedTeam, players: selectedPlayers } : t));
            closeModal();
        });
    };

    const handleAddTeam = async () => {
        fetch("/api/admin/teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newTeam, players: selectedPlayers }),
        }).then(res => res.json()).then(data => {
            setTeams([...teams, data]);
            closeModal();
        });
    };

    const handleDeleteTeam = async (teamId) => {
        fetch(`/api/admin/teams/${teamId}`, { method: "DELETE" }).then(() => {
            setTeams(teams.filter(t => t._id !== teamId));
        });
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-r from-purple-700 to-pink-500 text-white pb-20">
            <div className="p-6">
                <h1 className="text-4xl font-extrabold text-center mb-8 drop-shadow-lg">Admin Dashboard</h1>
                <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 bg-white text-purple-700 px-5 py-3 rounded-lg shadow-lg hover:bg-purple-100 transition-all">
                    <PlusCircle size={20} /> Add Team
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                    {teams.map((team) => (
                        <motion.div key={team._id} className="p-5 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl shadow-lg">
                            <div className="flex items-center gap-4">
                                <img src={team.team_logo} alt={team.team_name} className="w-16 h-16 rounded-full border-2 border-white" />
                                <div>
                                    <h2 className="text-lg font-semibold">{team.team_name}</h2>
                                    <p className="text-sm text-gray-300">Manager: {team.manager}</p>
                                </div>
                                <button onClick={() => openModal(team)} className="text-blue-300 hover:text-blue-500"><Edit size={18} /></button>
                                <button onClick={() => handleDeleteTeam(team._id)} className="text-red-300 hover:text-red-500"><Trash size={18} /></button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {showEditModal && (
                    <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                        <motion.div className="relative bg-white text-black p-6 rounded-xl shadow-xl w-full max-w-lg">
                            <button onClick={closeModal} className="absolute top-4 right-5 text-gray-500 hover:text-gray-800"><X size={24} /></button>
                            <h2 className="text-2xl font-bold mb-3">{selectedTeam ? "Edit Team" : "Add New Team"}</h2>
                            <input type="text" placeholder="Team Name" value={selectedTeam?.team_name || newTeam.team_name} 
                                onChange={(e) => selectedTeam ? setSelectedTeam({ ...selectedTeam, team_name: e.target.value }) : 
                                setNewTeam({ ...newTeam, team_name: e.target.value })} className="mt-3 w-full p-2 border rounded-md" />
                            <input type="text" placeholder="Manager Name" value={selectedTeam?.manager || newTeam.manager} 
                                onChange={(e) => selectedTeam ? setSelectedTeam({ ...selectedTeam, manager: e.target.value }) : 
                                setNewTeam({ ...newTeam, manager: e.target.value })} className="mt-3 w-full p-2 border rounded-md" />
                            <input type="url" placeholder="Team Logo URL" value={selectedTeam?.team_logo || newTeam.team_logo} 
                                onChange={(e) => selectedTeam ? setSelectedTeam({ ...selectedTeam, team_logo: e.target.value }) : 
                                setNewTeam({ ...newTeam, team_logo: e.target.value })} className="mt-3 w-full p-2 border rounded-md" />
                            <div className="mt-3">
                                <h3 className="text-lg font-semibold">Select Players</h3>
                                <div className="mt-2 border p-2 rounded-md max-h-40 overflow-auto">
                                    {players.map((player) => (
                                        <div key={player._id} className="flex items-center gap-2 p-1 border-b">
                                            <input type="checkbox" checked={selectedPlayers.includes(player._id)} 
                                                onChange={() => {
                                                    setSelectedPlayers(prev => prev.includes(player._id) ? prev.filter(id => id !== player._id) : [...prev, player._id]);
                                                }} />
                                            <p>{player.name} ({player.position})</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={selectedTeam ? handleEditTeam : handleAddTeam} className="mt-4 w-full bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-900 transition-all">
                                {selectedTeam ? "Update Team" : "Add Team"}
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
