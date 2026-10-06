"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye, CheckCircle2, XCircle, Clock, X,
  Package, CreditCard, Calendar, User,
  Loader2, Search, AlertTriangle, ZoomIn,
  ChevronLeft, ChevronRight, FileDown
} from "lucide-react";
import axiosInstance from "@/lib/axios";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Subscription {
  _id: string;
  client: { _id: string; userName?: string; email: string } | null;
  package: { _id: string; name: string } | null;
  totalPrice: number;
  originalPrice: number;
  discountAmount: number;
  paymentMethod: string;
  paymentProof: string;
  paymentStatus: string;
  status: "pending" | "active" | "rejected" | "cancelled" | "expired";
  durationInMonths: number;
  couponCode?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_CONFIG = {
  pending:   { label: "Pending",   class: "bg-amber-400/10 text-amber-400 border-amber-400/20"  },
  active:    { label: "Active",    class: "bg-[#c8fe1b]/10 text-[#c8fe1b] border-[#c8fe1b]/20"  },
  rejected:  { label: "Rejected",  class: "bg-red-400/10 text-red-400 border-red-400/20"         },
  cancelled: { label: "Rejected",  class: "bg-red-400/10 text-red-400 border-red-400/20"         },
  expired:   { label: "Expired",   class: "bg-white/5 text-white/30 border-white/10"             },
};
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "â€”";
const getInitials = (email: string) => email?.slice(0, 2).toUpperCase() || "??";

// â”€â”€â”€ Proof / Detail Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ProofModal({ sub, onClose, onApprove, onReject, loading }: {
  sub: Subscription;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loading: boolean;
}) {
  const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
  const isImage = sub.paymentProof && /\.(jpg|jpeg|png|gif|webp)$/i.test(sub.paymentProof);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-white/10 rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Payment Proof</p>
            <h3 className="text-white font-extrabold uppercase tracking-tight text-lg">
              {sub.client?.email || "Unknown"}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/50 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Proof Image */}
        <div className="relative mx-6 mt-5 rounded-2xl overflow-hidden h-52 bg-black/40 border border-white/[0.07] flex items-center justify-center">
          {isImage ? (
            <img src={sub.paymentProof} alt="Payment proof" className="w-full h-full object-contain" />
          ) : sub.paymentProof ? (
            <a href={sub.paymentProof} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors">
              <ZoomIn size={32} />
              <p className="text-xs font-semibold uppercase tracking-wider">View Proof</p>
            </a>
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/20">
              <ZoomIn size={32} />
              <p className="text-xs">No proof uploaded</p>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs font-bold capitalize">
            {sub.paymentMethod}
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4 grid grid-cols-2 gap-3">
          {[
            { icon: User,       label: "Email",     value: sub.client?.email || "â€”" },
            { icon: Package,    label: "Package",   value: sub.package?.name || "â€”" },
            { icon: CreditCard, label: "Paid",      value: `${sub.totalPrice} EGP` },
            { icon: Calendar,   label: "Submitted", value: fmtDate(sub.createdAt) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-muted/50 border border-white/[0.06] rounded-xl px-3 py-2.5 flex items-center gap-2.5">
              <Icon size={14} className="text-white/30 flex-shrink-0" />
              <div>
                <p className="text-white/35 text-[9px] font-bold uppercase tracking-wider">{label}</p>
                <p className="text-white text-xs font-bold truncate max-w-[120px]">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Discount info if exists */}
        {sub.discountAmount > 0 && (
          <div className="mx-6 mb-3 px-3 py-2.5 rounded-xl bg-[#c8fe1b]/[0.04] border border-[#c8fe1b]/15">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c8fe1b]/50 mb-1">Coupon Applied: {sub.couponCode}</p>
            <p className="text-xs text-white/50">Original: <span className="line-through">{sub.originalPrice} EGP</span> â†’ Discount: <span className="text-[#c8fe1b]">{sub.discountAmount} EGP off</span></p>
          </div>
        )}

        {/* Actions */}
        {sub.status === "pending" && (
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={() => onReject(sub._id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 border border-red-600/30 text-red-400 font-bold uppercase tracking-wider text-sm hover:bg-red-600/20 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={16} />} Reject
            </button>
            <button
              onClick={() => onApprove(sub._id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/30 text-[#c8fe1b] font-bold uppercase tracking-wider text-sm hover:bg-[#c8fe1b]/20 hover:shadow-[0_0_20px_rgba(200,254,27,0.2)] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />} Approve
            </button>
          </div>
        )}
        {sub.status !== "pending" && (
          <div className="px-6 pb-6">
            <div className={`py-3 rounded-xl text-center text-sm font-bold uppercase tracking-wider border ${sc.class}`}>
              This subscription is {sc.label}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const [selected, setSelected] = useState<Subscription | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "rejected" | "expired">("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/subscriptions?page=${page}&limit=${LIMIT}`, { withCredentials: true });
      if (res.data.success) {
        setSubs(res.data.data);
        setTotal(res.data.pagination?.total || res.data.data.length);
      }
    } catch { showToast("Failed to load subscriptions", false); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await axiosInstance.put(`/subscriptions/${id}/approve`, {}, { withCredentials: true });
      if (res.data.success) {
        setSubs(prev => prev.map(s => s._id === id ? { ...s, status: "active" as const, paymentStatus: "paid" } : s));
        if (selected?._id === id) setSelected(prev => prev ? { ...prev, status: "active" as const } : null);
        showToast("Subscription approved! Email sent to client.");
      }
    } catch (e: any) { showToast(e.response?.data?.message || "Failed to approve", false); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await axiosInstance.put(`/subscriptions/${id}/reject`, {}, { withCredentials: true });
      if (res.data.success) {
        setSubs(prev => prev.map(s => s._id === id ? { ...s, status: "cancelled" as const } : s));
        if (selected?._id === id) setSelected(prev => prev ? { ...prev, status: "cancelled" as const } : null);
        showToast("Subscription rejected.");
      }
    } catch (e: any) { showToast(e.response?.data?.message || "Failed to reject", false); }
    finally { setActionLoading(false); }
  };

  const handleDownloadInvoice = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/subscriptions/${id}/invoice`, {
        responseType: "blob", withCredentials: true
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { showToast("Failed to download invoice", false); }
  };

  const displayed = subs.filter(s => {
    const matchFilter = filter === "all" || s.status === filter;
    const matchSearch = s.client?.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.package?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendingCount = subs.filter(s => s.status === "pending").length;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[#c8fe1b] text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-[#c8fe1b]" /> Approval Flow
          </p>
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight flex items-center gap-3">
            Subscriptions
            {pendingCount > 0 && (
              <span className="text-sm font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full animate-pulse">
                {pendingCount} pending
              </span>
            )}
          </h1>
          <p className="text-white/40 text-sm mt-1">{total} total subscriptions</p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total",    value: total,        class: "text-white",      bg: "bg-white/[0.03] border-white/[0.07]" },
          { label: "Pending",  value: subs.filter(s => s.status === "pending").length,  class: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/20" },
          { label: "Active",   value: subs.filter(s => s.status === "active").length,   class: "text-[#c8fe1b]",  bg: "bg-[#c8fe1b]/10 border-[#c8fe1b]/20" },
          { label: "Rejected", value: subs.filter(s => s.status === "rejected").length, class: "text-red-400",    bg: "bg-red-500/10 border-red-500/20" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`rounded-2xl border p-5 ${s.bg}`}>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-extrabold ${s.class}`}>{loading ? "â€”" : s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative max-w-xs w-full">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or package..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/[0.07] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "active", "rejected", "expired"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === f
                  ? "bg-[#c8fe1b]/10 text-[#c8fe1b] border-[#c8fe1b]/25"
                  : "bg-card text-white/40 border-white/[0.07] hover:text-white hover:border-white/20"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-white/25 text-xs font-semibold ml-auto">{displayed.length} shown</p>
      </div>

      {/* Table */}
      <div className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.8fr_1.2fr_110px_130px_130px_160px] gap-4 px-6 py-3.5 border-b border-white/[0.07] bg-white/[0.01]">
          {["Client", "Package", "Amount", "Method", "Date", "Actions"].map(h => (
            <p key={h} className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={28} className="animate-spin text-[#c8fe1b]/40" />
            <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Loading subscriptions...</p>
          </div>
        )}

        {/* Rows */}
        {!loading && (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {displayed.map((sub, i) => {
                const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.expired;
                return (
                  <motion.div
                    key={sub._id} layout
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[1.8fr_1.2fr_110px_130px_130px_160px] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Client */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c8fe1b]/20 to-lime-400/10 border border-[#c8fe1b]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-extrabold text-[#c8fe1b]">{getInitials(sub.client?.email || "")}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-bold truncate">{sub.client?.email || "â€”"}</p>
                        <span className={`inline-flex text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border mt-0.5 ${sc.class}`}>
                          {sc.label}
                        </span>
                      </div>
                    </div>

                    {/* Package */}
                    <p className="text-white/70 text-sm font-semibold truncate">{sub.package?.name || "â€”"}</p>

                    {/* Amount */}
                    <div>
                      <p className="text-white font-extrabold text-sm">{sub.totalPrice} EGP</p>
                      {sub.discountAmount > 0 && (
                        <p className="text-[#c8fe1b]/60 text-[9px] font-bold">-{sub.discountAmount} off</p>
                      )}
                    </div>

                    {/* Method */}
                    <p className="text-white/50 text-xs font-semibold capitalize">{sub.paymentMethod}</p>

                    {/* Date */}
                    <p className="text-white/40 text-xs">{fmtDate(sub.createdAt)}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelected(sub)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        <Eye size={11} /> Proof
                      </button>
                      {sub.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(sub._id)} className="w-7 h-7 rounded-lg bg-[#c8fe1b]/10 hover:bg-[#c8fe1b]/20 border border-[#c8fe1b]/20 flex items-center justify-center text-[#c8fe1b] transition-all" title="Approve">
                            <CheckCircle2 size={13} />
                          </button>
                          <button onClick={() => handleReject(sub._id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-all" title="Reject">
                            <XCircle size={13} />
                          </button>
                        </>
                      )}
                      {sub.status === "active" && (
                        <button onClick={() => handleDownloadInvoice(sub._id)} title="Download Invoice"
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] flex items-center justify-center text-white/40 hover:text-white transition-all">
                          <FileDown size={12} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && displayed.length === 0 && (
          <div className="text-center py-20">
            <Clock size={36} className="text-white/8 mx-auto mb-4" />
            <p className="text-white/25 font-bold uppercase tracking-wider text-sm">No subscriptions found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-3.5 border-t border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
          <p className="text-white/25 text-xs font-semibold">Page {page} of {totalPages || 1} Â· {total} total</p>
          <div className="flex gap-1 items-center">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${page === p ? "bg-[#c8fe1b]/20 text-[#c8fe1b] border border-[#c8fe1b]/30" : "text-white/30 hover:text-white hover:bg-white/[0.05]"}`}>
                {p}
              </button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Proof Modal */}
      <AnimatePresence>
        {selected && (
          <ProofModal
            sub={selected}
            onClose={() => setSelected(null)}
            onApprove={(id) => { handleApprove(id); setSelected(null); }}
            onReject={(id) => { handleReject(id); setSelected(null); }}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            className={`fixed bottom-6 left-1/2 border text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 backdrop-blur-xl ${
              toast.ok ? "bg-muted/90 border-[#c8fe1b]/20 text-white" : "bg-muted/90 border-red-500/20 text-white"
            }`}
          >
            {toast.ok ? <CheckCircle2 size={14} className="text-[#c8fe1b]" /> : <AlertTriangle size={14} className="text-red-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
