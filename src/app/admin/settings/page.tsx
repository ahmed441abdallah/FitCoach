"use client";

import { motion } from "motion/react";
import { User, Bell, Shield, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

type SettingsItem =
  | { label: string; type: "text";   value: string  }
  | { label: string; type: "toggle"; defaultOn: boolean }
  | { label: string; type: "button" };

const SETTINGS_SECTIONS: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: SettingsItem[];
}[] = [
  {
    title: "Profile",
    icon: User,
    items: [
      { label: "Admin Name",     value: "Admin",            type: "text"   },
      { label: "Email Address",  value: "admin@fitcoach.com", type: "text" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Telegram Alerts for New Requests", type: "toggle", defaultOn: true  },
      { label: "Email on Approval",               type: "toggle", defaultOn: false },
      { label: "Weekly Revenue Report",           type: "toggle", defaultOn: true  },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      { label: "Change Password",            type: "button"                  },
      { label: "Two-Factor Authentication", type: "toggle", defaultOn: false },
    ],
  },
];

export default function AdminSettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Telegram Alerts for New Requests": true,
    "Email on Approval":               false,
    "Weekly Revenue Report":           true,
    "Two-Factor Authentication":       false,
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-[#c8fe1b] text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
          <span className="w-4 h-px bg-[#c8fe1b]" /> Configuration
        </p>
        <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">Settings</h1>
      </div>

      {SETTINGS_SECTIONS.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center">
              <section.icon size={15} className="text-[#c8fe1b]" />
            </div>
            <h2 className="text-white font-extrabold uppercase tracking-wide text-sm">{section.title}</h2>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-6 py-4">
                <p className="text-white/70 text-sm font-semibold">{item.label}</p>

                {item.type === "toggle" && (
                  <button
                    onClick={() => setToggles((prev) => ({ ...prev, [item.label]: !prev[item.label] }))}
                    className="transition-all"
                  >
                    {toggles[item.label]
                      ? <ToggleRight size={28} className="text-[#c8fe1b]" />
                      : <ToggleLeft  size={28} className="text-white/20"  />
                    }
                  </button>
                )}

                {item.type === "text" && (
                  <input
                    defaultValue={item.value}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white text-sm focus:outline-none focus:border-[#c8fe1b]/40 transition-all text-right normal-case font-normal tracking-normal"
                  />
                )}

                {item.type === "button" && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.07] text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition-all hover:border-white/20">
                    Update <ChevronRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Save */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl bg-[#c8fe1b] text-black font-bold uppercase tracking-widest text-sm hover:bg-lime-300 hover:shadow-[0_0_24px_rgba(200,254,27,0.35)] transition-all"
      >
        Save Changes
      </motion.button>
    </div>
  );
}
