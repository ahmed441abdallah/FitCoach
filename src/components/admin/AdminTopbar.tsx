"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Bell, Search, Menu } from "lucide-react";

interface AdminTopbarProps {
  onMobileMenuOpen: () => void;
}

export default function AdminTopbar({ onMobileMenuOpen }: AdminTopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-4 px-6 bg-background/80 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden text-white/50 hover:text-white transition-colors p-1"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className={`relative flex-1 max-w-md transition-all duration-300 ${searchFocused ? "max-w-lg" : ""}`}>
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input
          type="text"
          placeholder="Search trainees, plans..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40 focus:bg-white/[0.06] transition-all normal-case font-normal tracking-normal"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-[#c8fe1b] hover:border-[#c8fe1b]/20 transition-all"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c8fe1b] rounded-full ring-2 ring-background animate-pulse" />
        </motion.button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c8fe1b] to-lime-400 flex items-center justify-center shadow-[0_0_16px_rgba(200,254,27,0.3)]">
            <span className="text-sm font-bold text-black">A</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-xs font-bold leading-none">Admin</p>
            <p className="text-white/40 text-[10px] mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
