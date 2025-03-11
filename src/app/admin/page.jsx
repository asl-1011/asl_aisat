"use client";

import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const NewsEditor = lazy(() => import("@/components/admin/NewsEditor"));
const MatchControl = lazy(() => import("@/components/admin/MatchSection"));
const RankingTable = lazy(() => import("@/components/RankingTable"));

const AdminDashboard = () => {
  const [matchData, setMatchData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/matches");
        if (!response.ok) throw new Error("Failed to fetch match data");
        const matchRes = await response.json();
        setMatchData(matchRes);
        setError(null); // Clear error if successful
      } catch (err) {
        setError("Failed to load match data.");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const MemoizedNavbar = useMemo(() => <Navbar />, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <motion.header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-full w-full px-4 py-3 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="bg-gradient-to-r from-gray-300 to-gray-100 rounded-xl h-10 w-10 flex items-center justify-center shadow-md">
              <span className="font-bold text-sm text-gray-900">ASL</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Admin Dashboard</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="w-full px-4 py-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* News Editor */}
          <Suspense fallback={<SkeletonLoader text="Loading News Editor..." />}>
            <NewsEditor />
          </Suspense>

          {/* Match Control with Error Handling */}
          {error ? (
            <ErrorBox error={error} />
          ) : (
            <Suspense fallback={<SkeletonLoader text="Loading Match Control..." />}>
              <MatchControl matchData={matchData} />
            </Suspense>
          )}

          {/* Rankings Section */}
          <Suspense fallback={<SkeletonLoader text="Loading Rankings..." />}>
            <RankingTable />
          </Suspense>
        </motion.div>
      </main>

      {/* Navbar */}
      {MemoizedNavbar}
    </div>
  );
};

/* Skeleton Loader for Lazy Components */
const SkeletonLoader = ({ text }) => (
  <div className="h-[400px] bg-white rounded-lg border shadow-sm p-4 animate-pulse flex items-center justify-center text-gray-500">
    {text}
  </div>
);

/* Error Box for Handling Fetch Errors */
const ErrorBox = ({ error }) => (
  <div className="h-[400px] bg-red-50 rounded-lg border border-red-100 shadow-sm p-4 text-red-700 flex items-center justify-center">
    <span>Error: {error}</span>
  </div>
);

export default AdminDashboard;
