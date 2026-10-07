"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { motion } from "motion/react";
import {
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  FileText,
  Send,
  UserPlus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLOR_MAP: Record<string, { icon: string; glow: string; badge: string }> = {
  lime:   { icon: "text-[#c8fe1b]", glow: "shadow-[0_0_20px_rgba(200,254,27,0.08)]",  badge: "bg-[#c8fe1b]/10 text-[#c8fe1b] border-[#c8fe1b]/20"  },
  blue:   { icon: "text-blue-400",  glow: "shadow-[0_0_20px_rgba(96,165,250,0.08)]",  badge: "bg-blue-400/10 text-blue-400 border-blue-400/20"    },
  amber:  { icon: "text-amber-400", glow: "shadow-[0_0_20px_rgba(251,191,36,0.08)]",  badge: "bg-amber-400/10 text-amber-400 border-amber-400/20"  },
  orange: { icon: "text-orange-400",glow: "shadow-[0_0_20px_rgba(251,146,60,0.08)]",  badge: "bg-orange-400/10 text-orange-400 border-orange-400/20"},
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-[#c8fe1b] text-lg font-extrabold">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get("/subscriptions/stats/dashboard", { withCredentials: true });
        setDashboardData(data.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-10 text-white text-center">Loading dashboard...</div>;
  }

  // Map backend stats to the UI structure
  const STAT_CARDS = [
    { label: "Total Revenue",    value: `${dashboardData?.stats?.totalRevenue || 0} EGP`, change: "Total", icon: DollarSign,    color: "lime",   desc: "All time" },
    { label: "Active Trainees",  value: dashboardData?.stats?.activeTrainees || 0,        change: "Active", icon: Users,         color: "blue",   desc: "Currently active" },
    { label: "Pending Approvals",value: dashboardData?.stats?.pendingApprovals || 0,      change: "Pending",icon: Clock,         color: "amber",  desc: "Needs review" },
    { label: "Expiring Soon",    value: dashboardData?.stats?.expiringSoon || 0,          change: "7 days", icon: AlertTriangle, color: "orange", desc: "Need renewal" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[#c8fe1b] text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-[#c8fe1b]" /> Overview
          </p>
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">Dashboard</h1>
        </div>
        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => {
          const colors = COLOR_MAP[card.color];
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={`bg-card border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden ${colors.glow}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted border border-white/[0.06] flex items-center justify-center">
                  <card.icon size={18} className={colors.icon} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${colors.badge}`}>
                  {card.change}
                </span>
              </div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-extrabold text-white">{card.value}</p>
              <p className="text-white/30 text-xs mt-1">{card.desc}</p>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/[0.02]" />
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart + Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="xl:col-span-8 bg-card border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Revenue Trend</p>
              <h2 className="text-white text-xl font-extrabold uppercase tracking-tight">Last 6 Months</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[#c8fe1b] text-sm font-bold bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 px-3 py-1.5 rounded-xl">
              <TrendingUp size={14} /> +18.2%
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dashboardData?.revenueData || []} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c8fe1b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#c8fe1b" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#c8fe1b"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={{ fill: "#c8fe1b", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "#c8fe1b", stroke: "rgba(200,254,27,0.3)", strokeWidth: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="xl:col-span-4 bg-card border border-white/[0.07] rounded-2xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white text-base font-extrabold uppercase tracking-tight">Recent Activity</h2>
            <button className="text-[#c8fe1b] text-xs font-bold uppercase tracking-wider hover:text-lime-300 flex items-center gap-1 transition-colors">
              All <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {dashboardData?.recentActivity?.map((item: any, i: number) => {
              const isApproved = item.status === "active";
              const isPending = item.status === "pending";
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="flex items-start gap-3 group"
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isApproved ? "bg-[#c8fe1b]/10 text-[#c8fe1b]" : "bg-amber-400/10 text-amber-400"}`}>
                    {isApproved ? <CheckCircle2 size={14} /> : <FileText size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold leading-snug">
                      {isApproved ? "Subscription approved for" : "New request from"} {item.client?.userName || "Unknown"}
                    </p>
                    <p className="text-white/35 text-[10px] mt-0.5 truncate">
                      {item.package?.name || "Unknown"} Plan · {item.durationInMonths} months · {item.totalPrice} EGP
                    </p>
                  </div>
                  <p className="text-white/25 text-[10px] flex-shrink-0 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
