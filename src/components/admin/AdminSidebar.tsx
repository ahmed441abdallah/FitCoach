"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  LogOut,
  Box,
  Tag,
  ListChecks,
  Utensils,
  Apple,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { logout, reset } from "@/lib/features/auth/authSlice";

const NAV_ITEMS = [
  { href: "/admin",                icon: LayoutDashboard, label: "Dashboard"      },
  { href: "/admin/trainees",       icon: Users,           label: "Trainees"       },
  { href: "/admin/subscriptions",  icon: ClipboardList,   label: "Subscriptions"  },
  { href: "/admin/packages",       icon: Box,             label: "Packages"       },
  { href: "/admin/coupons",        icon: Tag,             label: "Coupons"        },
  { href: "/admin/workout-builder",icon: Wrench,          label: "Workout Builder"},
  { href: "/admin/workout-plans",  icon: ListChecks,      label: "Workout Plans"  },
  { href: "/admin/diet-builder",   icon: Utensils,        label: "Diet Builder"   },
  { href: "/admin/diet-plans",     icon: Apple,           label: "Diet Plans"     },
  { href: "/admin/chat",           icon: MessageSquare,   label: "Messages"       },
  { href: "/admin/settings",       icon: Settings,        label: "Settings"       },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (val: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    router.push("/");
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]",
        collapsed && !mobile ? "justify-center" : ""
      )}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#c8fe1b] flex items-center justify-center shadow-[0_0_20px_rgba(200,254,27,0.35)]">
          <Flame size={18} className="text-black" />
        </div>
        {(!collapsed || mobile) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="overflow-hidden"
          >
            <p className="text-white font-extrabold uppercase tracking-wider text-sm leading-none">FitCoach</p>
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Admin Panel</p>
          </motion.div>
        )}
        {mobile && (
          <button onClick={onMobileClose} className="ml-auto text-white/40 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={mobile ? onMobileClose : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group relative",
                collapsed && !mobile ? "justify-center" : "",
                active
                  ? "bg-[#c8fe1b]/10 text-[#c8fe1b] border border-[#c8fe1b]/20 shadow-[0_0_12px_rgba(200,254,27,0.08)]"
                  : "text-white/50 hover:text-white hover:bg-white/[0.05] border border-transparent"
              )}
            >
              {active && (
                <motion.div
                  layoutId={mobile ? "mobile-nav-pill" : "nav-pill"}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#c8fe1b] rounded-r-full"
                />
              )}
              <item.icon
                size={18}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  active ? "text-[#c8fe1b]" : "text-white/40 group-hover:text-white"
                )}
              />
              {(!collapsed || mobile) && (
                <span className="text-sm font-semibold tracking-wide">{item.label}</span>
              )}
              {collapsed && !mobile && (
                <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-muted border border-white/10 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("px-3 py-4 border-t border-white/[0.06]", collapsed && !mobile ? "flex justify-center" : "")}>
        {(!collapsed || mobile) ? (
          <div onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c8fe1b] to-lime-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(200,254,27,0.3)]">
              <span className="text-xs font-bold text-black">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">Admin</p>
              <p className="text-white/40 text-[10px] truncate">admin@fitcoach.com</p>
            </div>
            <LogOut size={14} className="text-white/30 group-hover:text-[#c8fe1b] transition-colors flex-shrink-0" />
          </div>
        ) : (
          <div onClick={handleLogout} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c8fe1b] to-lime-400 flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(200,254,27,0.3)] group relative">
            <span className="text-xs font-bold text-black">A</span>
            <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-muted border border-white/10 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl flex items-center gap-1.5">
              <LogOut size={12} className="text-[#c8fe1b]" /> Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-card/80 backdrop-blur-xl border-r border-white/[0.06] overflow-hidden relative z-30"
      >
        <SidebarContent />
        <button
          onClick={() => onCollapse(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-muted border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all z-10 shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[260px] bg-card border-r border-white/[0.06] z-50 lg:hidden overflow-hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
