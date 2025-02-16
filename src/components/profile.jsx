import React from 'react';
import Navbar from "@components/Navbar.jsx";
import { Trophy, DollarSign, Users, Star } from 'lucide-react';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { StatsCard } from '../components/profile/StatsCard';
import { SeasonStats } from '../components/profile/SeasonStats';
import { PerformanceTable } from '../components/profile/PerformanceTable';
import { motion } from 'framer-motion';

const recentPerformances = [
  { opponent: 'Liverpool', result: 'W 3-1', goals: 2, assists: 1, rating: 9.2 },
  { opponent: 'Arsenal', result: 'D 2-2', goals: 1, assists: 1, rating: 8.5 },
  { opponent: 'Chelsea', result: 'W 2-0', goals: 2, assists: 0, rating: 8.8 },
];

export default function Profile() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 bg-gray-100 rounded-xl shadow-lg"
    >
      <ProfileHeader 
        coverImage="https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
        profileImage="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        isPro={true}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10 bg-white p-4 sm:p-6 rounded-lg shadow-md"
      >
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 mb-4"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Marcus Sterling</h1>
            <p className="text-gray-500 text-md sm:text-lg">Forward / Striker</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex gap-4 sm:gap-6 items-center mt-4 sm:mt-0"
          >
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500">Account Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">€2.5M</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              Edit Profile
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
        >
          <StatsCard icon={Trophy} iconColor="text-yellow-500" label="Rank" value="#3" subtitle="Global Ranking" />
          <StatsCard icon={Star} iconColor="text-blue-500" label="Rating" value="89" subtitle="Player Rating" />
          <StatsCard icon={DollarSign} iconColor="text-green-500" label="Value" value="75M" subtitle="Market Value" />
          <StatsCard icon={Users} iconColor="text-purple-500" label="Team" value="MCI" subtitle="Manchester City" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <SeasonStats stats={{ goals: 28, assists: 15, matches: 42 }} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <PerformanceTable performances={recentPerformances} />
        </motion.div>
      </motion.div>
      
      <Navbar />
    </motion.div>
  );
}
