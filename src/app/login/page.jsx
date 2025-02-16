"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAllDeviceData } from "@/utils/deviceInfo";

export default function AuthPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const deviceData = await getAllDeviceData();
  
        // Function to encode JSON data in Base64
        function encodeBase64(data) {
          return Buffer.from(JSON.stringify(data)).toString("base64");
        }
  
        const encodedData = encodeBase64(deviceData);
  
        await fetch("/api/device-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ encodedData }), // Send as Base64 string
        });
      } catch (error) {
        console.error("Error logging device data:", error);
      }
    })();
  }, []);
  
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isSignup }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (data.success && !isSignup) router.push("/home");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, isSignup, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-yellow-300 to-purple-600">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-gray-900"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">{isSignup ? "Sign Up" : "Login"}</h2>
        {message && <p className="text-center text-red-500 mb-4 text-lg">{message}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <InputField icon={User} name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          )}
          <InputField icon={Mail} name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <InputField icon={Lock} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 text-white p-3 rounded-lg text-xl font-semibold hover:opacity-90 transition">
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-lg">
          {isSignup ? "Already have an account?" : "Don't have an account?"} {" "}
          <button onClick={() => setIsSignup((prev) => !prev)} className="text-purple-700 font-semibold hover:underline">
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 text-gray-500" />
    <input {...props} className="w-full p-3 pl-10 border rounded-lg text-xl bg-gray-50" required />
  </div>
);
