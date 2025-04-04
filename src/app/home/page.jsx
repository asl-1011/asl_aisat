"use client";

import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const MatchSection = lazy(() => import("@/components/MatchSection"));
const RankingTable = lazy(() => import("@/components/RankingTable"));
const NewsSection = lazy(() => import("@/components/NewsSection"));
const PlayerStats = lazy(() => import("@/components/PlayerStats"));

const Index = () => {
  const router = useRouter();
  const [matchData, setMatchData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchRes = fetch("/api/matches").then((res) => res.json());
        const authRes = fetch("/api/auth-check", {
          method: "POST",
          credentials: "include",
        })
          .then((res) => (res.ok ? res.json() : { authenticated: false, isAdmin: false }))
          .catch(() => ({ authenticated: false, isAdmin: false }));

        const [matchData, authData] = await Promise.all([matchRes, authRes]);
        setMatchData(matchData);
        setIsLoggedIn(authData.authenticated);
        setIsAdmin(authData.isAdmin);
        setError(null); // Reset error state on successful fetch
      } catch (err) {
        setError("Failed to load data.");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.refresh();
  };

  const MemoizedNavbar = useMemo(() => <Navbar />, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header className="bg-white border-b sticky top-0 z-50 shadow-md">
        <div className="max-w-full w-full px-4 sm:px-6 py-2 flex justify-between items-center">
          {/* Branding with ASL Logo */}
          <motion.div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src="/assets/logo-asl.png"
              alt="ASL Logo"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </motion.div>

          {/* Action Buttons */}
          <div className="flex space-x-1 sm:space-x-2">
            {isLoggedIn && isAdmin && (
              <button
                className="bg-indigo-600 text-white px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all shadow-md hover:bg-indigo-700 hover:scale-105"
                onClick={() => router.push("/admin")}
              >
                update
              </button>
            )}
            {isLoggedIn ? (
              <button
                className="bg-red-500 text-white px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all shadow-md hover:bg-red-600 hover:scale-105"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  className="bg-gray-300 text-gray-900 px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all shadow-md hover:bg-gray-400 hover:scale-105"
                  onClick={() => router.push("/login")}
                >
                  Login
                </button>
                <button
                  className="bg-gray-900 text-white px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all shadow-md hover:bg-black hover:scale-105"
                  onClick={() => router.push("/signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <main className="w-full px-4 py-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Suspense fallback={<SkeletonLoader />}>
            <NewsSection />
          </Suspense>
          {error ? (
            <ErrorBox error={error} />
          ) : (
            <Suspense fallback={<SkeletonLoader />}>
              <MatchSection matchData={matchData} />
            </Suspense>
          )}
          <Suspense fallback={<SkeletonLoader />}>
            <RankingTable />
          </Suspense>
        </motion.div>
      </main>
      {MemoizedNavbar}
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="h-[400px] bg-white rounded-lg border shadow-sm p-4 animate-pulse flex items-center justify-center text-gray-500">
    Loading...
  </div>
);

const ErrorBox = ({ error }) => (
  <div className="h-[400px] bg-red-50 rounded-lg border border-red-100 shadow-sm p-4 text-red-700">
    Error: {error}
  </div>
);

export default Index;
