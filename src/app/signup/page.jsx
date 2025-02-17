"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAllDeviceData } from "@/utils/deviceInfo";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const deviceData = await getAllDeviceData();
        const encodedData = Buffer.from(JSON.stringify(deviceData)).toString("base64");

        await fetch("/api/device-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ encodedData }),
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

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isSignup: true }),
      });

      const data = await res.json();
      setMessage({ type: data.success ? "success" : "error", text: data.message });
      if (data.success) router.push("/home");
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [formData, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-yellow-300 to-purple-600">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-gray-900"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`p-4 mb-6 text-lg rounded-lg ${message.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
          >
            {message.text}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField icon={User} name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <InputField icon={Mail} name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <InputField icon={Lock} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          <InputField icon={Lock} name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 text-white p-3 rounded-lg text-xl font-semibold hover:opacity-90 transition duration-300 ease-in-out"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-6 text-lg">
          Already have an account?{" "}
          <button onClick={() => router.push("/login")} className="text-purple-700 font-semibold hover:underline">
            Login
          </button>
        </p>
      </motion.div>
    </div>
  );
}

const InputField = ({ icon: Icon, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 text-gray-500" />
    <input
      {...props}
      className="w-full p-3 pl-10 border rounded-lg text-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 transition duration-300"
      required
    />
  </div>
);
