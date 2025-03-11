import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Shield, Users, Settings } from "lucide-react";
import { IconClipboardList } from "@tabler/icons-react";

// Navigation items array with icons
const adminNavItems = [
  { name: "Dashboard", icon: Home, path: "/admin" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Matches", icon: IconClipboardList, path: "/admin/matches" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

// Admin Navbar component
export default function AdminNavbar() {
  const [hovered, setHovered] = useState(null);
  const pathname = usePathname();

  const activeTab = adminNavItems.find(item => item.path === pathname)?.name || "Dashboard";

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-900/80 to-gray-800/60 backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl border border-gray-700 flex gap-3 items-center justify-center transition-all duration-300 hover:shadow-xl">
      {adminNavItems.map((item) => (
        <AdminNavItem
          key={item.name}
          item={item}
          isActive={activeTab === item.name}
          isHovered={hovered === item.name}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}

// Admin NavItem component
function AdminNavItem({ item, isActive, isHovered, setHovered }) {
  const Icon = item.icon;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(item.name)}
      onMouseLeave={() => setHovered(null)}
    >
      <button
        onClick={() => window.location.href = item.path}
        className={`relative flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 focus:outline-none ${
          isActive
            ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-lg scale-105"
            : "text-gray-300 hover:bg-gray-700/40"
        }`}
      >
        <Icon
          size={22}
          className={`transition-all duration-300 ${
            isActive ? "text-white" : isHovered ? "text-blue-400" : "text-gray-400"
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
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" />
      )}
    </div>
  );
}
