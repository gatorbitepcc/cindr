// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";

/**
 * Fixed left sidebar (hidden on mobile) with a single Settings link.
 */
export default function Sidebar() {
  const { pathname } = useLocation();
  const isActive = (p: string) => pathname === p;

  return (
    // Hide on small screens, show on md+; dark style like Instagram
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-black text-white flex-col items-center py-6">
      <Link
        to="/settings"
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive("/settings") ? "text-white" : "text-gray-300 hover:text-white"
        }`}
        aria-label="Settings"
      >
        <Settings size={28} />
        <span className="text-[11px]">Settings</span>
      </Link>
    </aside>
  );
}
