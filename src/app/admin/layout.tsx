"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect if there's no user, or if the user is not an admin
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  // Prevent any render until client has mounted (avoids SSR/client hydration mismatch)
  if (!mounted) return null;

  // Redirect if there's no user, or if the user is not an admin
  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-screen bg-background items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#c8fe1b] border-t-transparent animate-spin" />
        <p className="text-[#c8fe1b] text-sm font-bold uppercase tracking-widest">Checking Authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <AdminSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopbar onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
