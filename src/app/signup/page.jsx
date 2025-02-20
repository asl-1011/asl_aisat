"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAllDeviceData } from "@/utils/deviceInfo";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceDataEncoded, setDeviceDataEncoded] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const deviceData = await getAllDeviceData();
        setDeviceDataEncoded(Buffer.from(JSON.stringify(deviceData)).toString("base64"));
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
    setMessage(null);
    setLoading(true);

    // 🔴 Validate Input Fields
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setMessage({ type: "error", text: "Invalid email format." });
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      // 🔹 Send Device Data in the Background
      if (deviceDataEncoded) {
        fetch("/api/device-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ encodedData: deviceDataEncoded }),
        });
      }

      // 🔹 Register User
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Sign-up successful. Redirecting..." });
        setTimeout(() => router.push("/home"), 2000); // 🔄 Smooth Redirect
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }, [formData, router, deviceDataEncoded]);

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
            className={`p-4 mb-6 text-lg rounded-lg ${
              message.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField icon={User} name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <InputField icon={Mail} name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <InputField icon={Lock} name="password" type="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={handleChange} />
          <InputField icon={Lock} name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-purple-500 text-white p-3 rounded-lg text-xl font-semibold hover:opacity-90 transition duration-300 ease-in-out"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Sign Up"
            )}
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
