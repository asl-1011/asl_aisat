"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@components/Navbar.jsx";

export default function TeamList() {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [playersOpen, setPlayersOpen] = useState(false);

    useEffect(() => {
        fetch("/api/teams")
            .then((res) => res.json())
            .then((data) => {
                setTeams(data);
            })
            .catch((error) => console.error("Error fetching teams:", error));
    }, []);

    const openModal = (team) => {
        setSelectedTeam(team);
        setPlayersOpen(false);
    };
    const closeModal = () => setSelectedTeam(null);

    return (
        <div className="relative min-h-screen bg-white text-black pb-20">
            <div className="p-6">
                <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wide">ASL Teams</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <motion.div
                            key={team._id}
                            className="p-5 border border-gray-300 rounded-xl shadow-md bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer flex items-center gap-4"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openModal(team)}
                        >
                            <img src={team.team_logo} alt={team.team_name} className="w-16 h-16 rounded-full" />
                            <div>
                                <h2 className="text-lg font-semibold">{team.team_name}</h2>
                                <p className="text-sm text-gray-600">Manager: {team.manager}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {selectedTeam && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -20 }} 
                            className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg relative border border-gray-300"
                        >
                            <button onClick={closeModal} className="absolute top-4 right-5 text-2xl text-gray-600 hover:text-gray-800">×</button>
                            <div className="text-center">
                                <img src={selectedTeam.team_logo} alt={selectedTeam.team_name} className="w-24 h-24 mx-auto rounded-full" />
                                <h2 className="text-2xl font-bold mt-3">{selectedTeam.team_name}</h2>
                                <p className="text-gray-600">Manager: {selectedTeam.manager}</p>
                            </div>

                            <div 
                                className="mt-6 flex items-center justify-between cursor-pointer border-b border-gray-300 pb-2"
                                onClick={() => setPlayersOpen(!playersOpen)}
                            >
                                <h3 className="text-lg font-semibold">Players</h3>
                                {playersOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                            </div>

                            <AnimatePresence>
                                {playersOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-4 overflow-hidden"
                                    >
                                        {selectedTeam.players.length > 0 ? (
                                            selectedTeam.players.map((player) => (
                                                <motion.div 
                                                    key={player._id} 
                                                    className="p-4 bg-gray-100 rounded-lg shadow-md my-2 flex items-center gap-4 border border-gray-300"
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    <img src={player.profilePic} alt={player.name} className="w-12 h-12 rounded-full" />
                                                    <div>
                                                        <h4 className="text-sm font-bold">{player.name}</h4>
                                                        <p className="text-xs text-gray-600">{player.position}</p>
                                                        <p className="text-xs text-gray-700">⚽ {player.stats.goals} | 🎯 {player.stats.assists}</p>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-gray-600 text-center">No players available</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-300">
                <Navbar />
            </div>
        </div>
    );
}
