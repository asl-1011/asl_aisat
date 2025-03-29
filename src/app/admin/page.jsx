"use client";

import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useSWR from "swr";
import Navbar from "@/components/Navbar";

const NewsEditor = lazy(() => import("@/components/admin/NewsEditor"));
const MatchControl = lazy(() => import("@/components/admin/MatchSection"));
const RankingTable = lazy(() => import("@/components/RankingTable"));

const fetcher = (url) =>
  fetch(url, { credentials: "include" }) // Ensures cookies are included
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch match data");
      return res.json();
    });

const AdminDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔹 Check if user is an admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/admin-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Ensure session cookies are included
          body: JSON.stringify({ action: "verify_admin" }),
        });

        const data = await res.json();
        if (!res.ok || !data.authenticated || !data.isAdmin) {
          throw new Error("Unauthorized");
        }

        setIsAdmin(true);
      } catch (error) {
        router.push("/"); // Redirect non-admins
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  // Fetch match data (only if admin)
  const { data: matchData, error, isLoading: isMatchLoading } = useSWR(
    isAdmin ? "/api/matches" : null,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  );

  const MemoizedNavbar = useMemo(() => <Navbar />, []);

  // 🔹 Show loading spinner while verifying admin access
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking Admin Access..." />
      </div>
    );
  }

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
          {isMatchLoading ? (
            <SkeletonLoader text="Loading Match Data..." />
          ) : error ? (
            <ErrorBox error={error.message} />
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

/* Loading Spinner for Admin Check */
const LoadingSpinner = ({ text }) => (
  <div className="flex flex-col items-center space-y-2">
    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
    <span className="text-gray-700 text-sm">{text}</span>
  </div>
);

export default AdminDashboard;
