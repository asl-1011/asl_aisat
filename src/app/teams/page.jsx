"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@components/Navbar.jsx";

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [playersOpen, setPlayersOpen] = useState(false);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then(setTeams)
      .catch(console.error);
  }, []);

  const openModal = useCallback(
    (team) => {
      if (selectedTeam !== team) {
        setSelectedTeam(team);
        setPlayersOpen(false);
      }
    },
    [selectedTeam]
  );

  const closeModal = useCallback(() => setSelectedTeam(null), []);

  const teamElements = useMemo(
    () =>
      teams.map((team) => (
        <motion.div
          key={team._id}
          className="p-5 border border-gray-300 rounded-xl shadow-md bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer flex items-center gap-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal(team)}
        >
          <img
            src={`/api/teams/logo/${team.team_logo}`}
            alt={team.team_name}
            className="w-16 h-16 rounded-full"
            loading="lazy"
          />
          <div>
            <h3 className="text-lg font-semibold">{team.team_name}</h3>
            <p className="text-sm text-gray-600">Manager: {team.manager}</p>
          </div>
        </motion.div>
      )),
    [teams, openModal]
  );

  return (
    <div className="relative min-h-screen bg-white text-black pb-20">
      <header className="rounded bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AISAT Super League</h1>
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {teamElements}
      </div>

      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-lg relative border border-gray-300 max-h-[90vh] overflow-hidden flex flex-col"
              layout
            >
              {/* Sticky Team Info Header */}
              <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 pt-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col items-center text-center w-full">
                    <img
                      src={`/api/teams/logo/${selectedTeam.team_logo}`}
                      alt={selectedTeam.team_name}
                      className="w-20 h-20 rounded-full mb-2"
                    />
                    <h2 className="text-xl font-bold">{selectedTeam.team_name}</h2>
                    <p className="text-gray-600 text-sm">
                      Manager: {selectedTeam.manager}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="absolute top-3 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow-sm"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Scrollable Player Content */}
              <div className="overflow-y-auto px-6 pb-6 pt-4">
                <div
                  className="flex items-center justify-between cursor-pointer border-b border-gray-300 pb-2"
                  onClick={() => setPlayersOpen((prev) => !prev)}
                >
                  <h3 className="text-lg font-semibold">Players</h3>
                  {playersOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>

                <AnimatePresence>
                  {playersOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 overflow-hidden"
                      layout
                    >
                      {selectedTeam.players.length > 0 ? (
                        selectedTeam.players.map((player) => (
                          <motion.div
                            key={player._id}
                            className="p-4 bg-gray-100 rounded-lg shadow-md my-2 flex items-center gap-4 border border-gray-300"
                            whileHover={{ scale: 1.02 }}
                          >
                            <img
                              src={`/api/teams/logo/${player.profilePic}`}
                              alt={player.name}
                              className="w-12 h-12 rounded-full"
                              loading="lazy"
                            />
                            <div>
                              <h4 className="text-sm font-bold">{player.name}</h4>
                              <p className="text-xs text-gray-600">{player.position}</p>
                              <p className="text-xs text-gray-700">
                                ⚽ {player.stats.goals} | 🎯 {player.stats.assists}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center">No players available</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t border-gray-300">
        <Navbar />
      </div>
    </div>
  );
}
