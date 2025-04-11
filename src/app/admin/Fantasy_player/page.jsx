"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatePlayerForm() {
  const [formData, setFormData] = useState({
    league_id: "",
    sports_id: "",
    player_team_id: "",
    player_uid: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createPlayer = async () => {
    const { league_id, sports_id, player_team_id, player_uid } = formData;
    if (!league_id || !sports_id || !player_team_id || !player_uid) {
      setMessage("⚠️ Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/Fantasy_player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setMessage(data.message || "Error");
    setLoading(false);
  };

  return (
    <motion.div 
      className="max-w-md mx-auto mt-10 bg-white shadow-xl rounded-2xl p-6 space-y-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-bold text-center">Create Fantasy Player</h2>
      
      {["league_id", "sports_id", "player_team_id", "player_uid"].map((field) => (
        <input
          key={field}
          name={field}
          type="text"
          value={formData[field]}
          onChange={handleChange}
          placeholder={field.replace(/_/g, " ").toUpperCase()}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ))}

      <motion.button
        onClick={createPlayer}
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition"
        whileTap={{ scale: 0.95 }}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Player"}
      </motion.button>

      <AnimatePresence>
        {message && (
          <motion.p
            className="text-center mt-2 text-sm"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
