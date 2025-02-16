import { useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Use the Next.js router
import { Home, Shield, Users, User as UserIcon } from "lucide-react";
import { IconShirtSport } from "@tabler/icons-react";

// Navigation items array with icons
const navItems = [
  { name: "Home", icon: Home, path: "/home" },
  { name: "Teams", icon: Shield, path: "/teams" },
  { name: "Players", icon: IconShirtSport, path: "/players" },
  { name: "Profile", icon: UserIcon, path: "/profile" },
];

// Navbar component
export default function Navbar() {
  const [hovered, setHovered] = useState(null); // Track hovered item
  const router = useRouter(); // Access Next.js router

  const activeTab = navItems.find(item => item.path === router.pathname)?.name || "Home";

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-white/70 to-white/40 backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl border border-white/30 flex gap-3 items-center justify-center transition-all duration-300 hover:shadow-xl">
      {navItems.map((item) => (
        <NavItem
          key={item.name}
          item={item}
          isActive={activeTab === item.name}
          isHovered={hovered === item.name}
          setHovered={setHovered}
          onClick={() => router.push(item.path)} // Navigate to the corresponding page
        />
      ))}
    </div>
  );
}

// NavItem component - handles each button
function NavItem({ item, isActive, isHovered, setHovered, onClick }) {
  const Icon = item.icon;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(item.name)}
      onMouseLeave={() => setHovered(null)}
    >
      <button
        onClick={onClick}
        className={`relative flex items-center gap-3  px-4 py-2 rounded-full transition-all duration-300 focus:outline-none ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
            : "text-gray-700 hover:bg-gray-300/40"
        }`}
      >
        <Icon
          size={22}
          className={`transition-all duration-300 ${
            isActive ? "text-white" : isHovered ? "text-blue-600" : "text-gray-700"
          }`}
        />

        {/* Label for active item */}
        <span
          className={`overflow-hidden font-medium text-sm transition-all duration-300 ${
            isActive ? "opacity-90 w-auto" : "opacity-0 w-0"
          }`}
        >
          {item.name}
        </span>

        {/* Tooltip for hovered item */}
        <div
          className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transform group-hover:translate-y-1 transition-all duration-300 ${
            isActive ? "hidden" : "block"
          }`}
        >
          {item.name}
        </div>
      </button>

      {/* Active indicator dot */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-gray-600 to-purple-500 rounded-full animate-bounce" />
      )}
    </div>
  );
}
