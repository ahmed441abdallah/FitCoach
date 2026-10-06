"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type Coupon,
} from "@/lib/features/coupons/couponSlice";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Copy,
  CopyCheck,
  Percent,
  Calendar,
  Clock,
  Search,
  BadgeCheck,
  BadgeX,
  ArrowUpDown,
} from "lucide-react";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const isExpired  = (d: string) => new Date(d) < new Date();
const daysLeft   = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
const fmtDate    = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const toInputDate = (d: string) => new Date(d).toISOString().split("T")[0];

// â”€â”€â”€ Delete Confirm Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DeleteModal({ coupon, onConfirm, onCancel, loading }: {
  coupon: Coupon;
  onConfirm: () => void;
  onCancel:  () => void;
  loading:   boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-extrabold uppercase tracking-tight">Delete Coupon</h3>
            <p className="text-white/40 text-xs mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-6">
          Are you sure you want to delete coupon{" "}
          <span className="text-[#c8fe1b] font-bold font-mono">"{coupon.code}"</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white text-sm font-bold uppercase tracking-wider transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Create / Edit Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface FormState { code: string; discount: number; expiresAt: string; }

function CouponModal({ initial, onClose, onSave, loading, apiError }: {
  initial:  FormState & { _id?: string };
  onClose:  () => void;
  onSave:   (data: FormState) => void;
  loading:  boolean;
  apiError: string | null;
}) {
  const [form, setForm] = useState<FormState>({
    code: initial.code,
    discount: initial.discount,
    expiresAt: initial.expiresAt,
  });

  const isEdit  = !!initial._id;
  const valid   = form.code.trim().length >= 3 && form.discount > 0 && form.discount <= 100 && !!form.expiresAt;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-white/[0.09] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center">
              {isEdit ? <Pencil size={15} className="text-[#c8fe1b]" /> : <Plus size={15} className="text-[#c8fe1b]" />}
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{isEdit ? "Edit Coupon" : "New Coupon"}</p>
              <h3 className="text-white font-extrabold uppercase tracking-tight">{isEdit ? initial.code : "Create Coupon"}</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Code */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Coupon Code</label>
            <div className="relative">
              <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20"
                maxLength={20}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#c8fe1b] text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8fe1b]/50 transition-all font-mono font-bold tracking-widest uppercase"
              />
            </div>
            <p className="text-white/20 text-[10px] mt-1.5">Minimum 3 characters Â· automatically uppercased</p>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Discount Percentage</label>
            <div className="relative">
              <Percent size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                type="number"
                min={1}
                max={100}
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#c8fe1b]/50 transition-all"
              />
            </div>
            {/* Visual slider */}
            <div className="mt-3 relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#c8fe1b] to-lime-400 rounded-full transition-all"
                style={{ width: `${Math.min(form.discount, 100)}%` }} />
            </div>
            <p className="text-white/20 text-[10px] mt-1.5">1% â€“ 100%</p>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Expiry Date</label>
            <div className="relative">
              <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#c8fe1b]/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-xs font-semibold">{apiError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/60 hover:text-white text-sm font-bold uppercase tracking-wider transition-all">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !valid}
            className="flex-1 py-3 rounded-xl bg-[#c8fe1b] hover:bg-lime-300 text-black text-sm font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(200,254,27,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isEdit ? "Save Changes" : "Create Coupon"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Coupon Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CouponRow({ coupon, onEdit, onDelete, index }: {
  coupon:   Coupon;
  onEdit:   () => void;
  onDelete: () => void;
  index:    number;
}) {
  const [copied, setCopied] = useState(false);
  const expired = isExpired(coupon.expiresAt);
  const left    = daysLeft(coupon.expiresAt);

  const copy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ delay: index * 0.05 }}
      className="grid grid-cols-[1.5fr_100px_140px_130px_130px_110px] gap-4 items-center px-6 py-4 hover:bg-white/[0.025] transition-colors group"
    >
      {/* Code + copy */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#c8fe1b]/8 border border-[#c8fe1b]/15 flex items-center justify-center">
          <Tag size={14} className="text-[#c8fe1b]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[#c8fe1b] font-mono font-extrabold text-sm tracking-widest">{coupon.code}</p>
            <button onClick={copy} title="Copy code"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-[#c8fe1b]">
              {copied ? <CopyCheck size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <p className="text-white/25 text-[10px] mt-0.5">
            Created {fmtDate(coupon.createdAt || coupon.expiresAt)}
          </p>
        </div>
      </div>

      {/* Discount */}
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-8 rounded-lg bg-[#c8fe1b]/10 border border-[#c8fe1b]/15 flex items-center justify-center">
          <Percent size={12} className="text-[#c8fe1b]" />
        </div>
        <span className="text-white font-extrabold text-lg">{coupon.discount}</span>
        <span className="text-white/30 text-xs font-bold">%</span>
      </div>

      {/* Status */}
      <div>
        {expired ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
            <BadgeX size={11} /> Expired
          </span>
        ) : left <= 7 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-amber-400/10 border-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            <Clock size={11} /> Expiring
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-[#c8fe1b]/10 border-[#c8fe1b]/20 text-[#c8fe1b] text-[10px] font-bold uppercase tracking-wider">
            <BadgeCheck size={11} /> Active
          </span>
        )}
      </div>

      {/* Expiry */}
      <div className="flex items-center gap-1.5">
        <Calendar size={12} className="text-white/25 flex-shrink-0" />
        <div>
          <p className="text-white/70 text-xs font-semibold">{fmtDate(coupon.expiresAt)}</p>
          {!expired && (
            <p className={`text-[9px] font-bold ${left <= 7 ? "text-amber-400" : "text-white/25"}`}>
              {left}d remaining
            </p>
          )}
        </div>
      </div>

      {/* Discount bar visual */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-white/25 text-[9px] font-bold uppercase tracking-wider">Value</span>
          <span className="text-white/50 text-[9px] font-bold">{coupon.discount}%</span>
        </div>
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${coupon.discount}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 + 0.3, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#c8fe1b] to-lime-400"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={onEdit}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#c8fe1b]/10 hover:bg-[#c8fe1b]/20 border border-[#c8fe1b]/20 text-[#c8fe1b] text-[10px] font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_10px_rgba(200,254,27,0.15)]">
          <Pencil size={10} /> Edit
        </button>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 flex items-center justify-center text-red-400 transition-all">
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const emptyForm = (): FormState & { _id?: string } => ({
  code: "",
  discount: 20,
  expiresAt: "",
});

export default function AdminCouponsPage() {
  const dispatch  = useAppDispatch();
  const { coupons, loading, error } = useAppSelector((s) => s.coupon);

  const [showCreate,    setShowCreate]    = useState(false);
  const [editTarget,    setEditTarget]    = useState<Coupon | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<Coupon | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState<"all" | "active" | "expiring" | "expired">("all");
  const [sortField,     setSortField]     = useState<"code" | "discount" | "expiresAt">("expiresAt");
  const [sortAsc,       setSortAsc]       = useState(true);

  useEffect(() => { dispatch(getCoupons()); }, [dispatch]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const handleCreate = useCallback(async (data: FormState) => {
    setSaving(true);
    try {
      await dispatch(createCoupon({ ...data, expiresAt: new Date(data.expiresAt).toISOString() })).unwrap();
      setShowCreate(false);
      showToast("Coupon created successfully!");
    } catch (e: any) { showToast(e || "Failed to create coupon", false); }
    finally { setSaving(false); }
  }, [dispatch]);

  const handleUpdate = useCallback(async (data: FormState) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await dispatch(updateCoupon({ id: editTarget._id, data: { ...data, expiresAt: new Date(data.expiresAt).toISOString() } })).unwrap();
      setEditTarget(null);
      showToast("Coupon updated!");
    } catch (e: any) { showToast(e || "Failed to update coupon", false); }
    finally { setSaving(false); }
  }, [dispatch, editTarget]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteCoupon(deleteTarget._id)).unwrap();
      setDeleteTarget(null);
      showToast("Coupon deleted.");
    } catch (e: any) { showToast(e || "Failed to delete", false); }
    finally { setDeleting(false); }
  }, [dispatch, deleteTarget]);

  const toggleSort = (f: typeof sortField) => {
    if (sortField === f) setSortAsc((v) => !v);
    else { setSortField(f); setSortAsc(true); }
  };

  const displayed = coupons
    .filter((c) => {
      const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
      const expired = isExpired(c.expiresAt);
      const soon    = !expired && daysLeft(c.expiresAt) <= 7;
      if (filterStatus === "active")   return matchSearch && !expired && !soon;
      if (filterStatus === "expiring") return matchSearch && soon;
      if (filterStatus === "expired")  return matchSearch && expired;
      return matchSearch;
    })
    .sort((a, b) => {
      const av = a[sortField as keyof Coupon] as any;
      const bv = b[sortField as keyof Coupon] as any;
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const active   = coupons.filter((c) => !isExpired(c.expiresAt) && daysLeft(c.expiresAt) > 7).length;
  const expiring = coupons.filter((c) => !isExpired(c.expiresAt) && daysLeft(c.expiresAt) <= 7).length;
  const expired  = coupons.filter((c) => isExpired(c.expiresAt)).length;

  const SortBtn = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button onClick={() => toggleSort(field)}
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors group">
      {label}
      <ArrowUpDown size={10} className={`transition-colors ${sortField === field ? "text-[#c8fe1b]" : "text-white/20 group-hover:text-white/40"}`} />
    </button>
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* â”€â”€ Header â”€â”€â”€ */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[#c8fe1b] text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-[#c8fe1b]" /> Discount Management
          </p>
          <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight leading-none">Coupons</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8fe1b] text-black text-sm font-bold uppercase tracking-wider hover:bg-lime-300 hover:shadow-[0_0_20px_rgba(200,254,27,0.4)] transition-all"
        >
          <Plus size={16} /> New Coupon
        </motion.button>
      </div>

      {/* â”€â”€ Summary Cards â”€â”€â”€ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length, icon: Tag,        color: "text-[#c8fe1b]", bg: "bg-[#c8fe1b]/10 border-[#c8fe1b]/20" },
          { label: "Active",        value: active,         icon: BadgeCheck, color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Expiring Soon", value: expiring,       icon: Clock,      color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20"   },
          { label: "Expired",       value: expired,        icon: BadgeX,     color: "text-red-400",   bg: "bg-red-500/10 border-red-500/20"       },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-card border border-white/[0.07] rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">{s.label}</p>
              <p className="text-white text-2xl font-extrabold leading-none">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* â”€â”€ Filters â”€â”€â”€ */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative max-w-xs w-full">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input type="text" placeholder="Search by code..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/[0.07] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#c8fe1b]/40 transition-all normal-case font-normal tracking-normal" />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "expiring", "expired"] as const).map((f) => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filterStatus === f
                  ? "bg-[#c8fe1b]/10 text-[#c8fe1b] border-[#c8fe1b]/25"
                  : "bg-card text-white/40 border-white/[0.07] hover:text-white hover:border-white/20"
              }`}>
              {f}
            </button>
          ))}
        </div>
        <p className="text-white/25 text-xs font-semibold ml-auto">{displayed.length} coupon{displayed.length !== 1 ? "s" : ""}</p>
      </div>

      {/* â”€â”€ Table â”€â”€â”€ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card border border-white/[0.07] rounded-2xl overflow-hidden">

        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_100px_140px_130px_130px_110px] gap-4 px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
          <SortBtn field="code"       label="Code"     />
          <SortBtn field="discount"   label="Discount" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Status</p>
          <SortBtn field="expiresAt"  label="Expires"  />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Value</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Actions</p>
        </div>

        {/* Rows */}
        {loading && coupons.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-[#c8fe1b] animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {displayed.map((c, i) => (
                <CouponRow
                  key={c._id}
                  coupon={c}
                  index={i}
                  onEdit={()   => setEditTarget(c)}
                  onDelete={() => setDeleteTarget(c)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty */}
        {!loading && displayed.length === 0 && (
          <div className="text-center py-20">
            <Tag size={40} className="text-white/8 mx-auto mb-4" />
            <p className="text-white/25 font-bold uppercase tracking-wider text-sm">No coupons found</p>
            <p className="text-white/15 text-xs mt-1 mb-6">
              {search || filterStatus !== "all" ? "Try adjusting your search or filter" : "Create your first coupon to start offering discounts"}
            </p>
            {!search && filterStatus === "all" && (
              <button onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 text-[#c8fe1b] text-sm font-bold uppercase tracking-wider hover:bg-[#c8fe1b]/20 transition-all">
                <Plus size={14} /> Create Coupon
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        {displayed.length > 0 && (
          <div className="px-6 py-3.5 border-t border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
            <p className="text-white/25 text-xs font-semibold">Showing {displayed.length} of {coupons.length} coupons</p>
          </div>
        )}
      </motion.div>

      {/* â”€â”€ Modals â”€â”€â”€ */}
      <AnimatePresence>
        {showCreate && (
          <CouponModal
            initial={emptyForm()}
            onClose={() => setShowCreate(false)}
            onSave={handleCreate}
            loading={saving}
            apiError={error}
          />
        )}
        {editTarget && (
          <CouponModal
            initial={{ _id: editTarget._id, code: editTarget.code, discount: editTarget.discount, expiresAt: toInputDate(editTarget.expiresAt) }}
            onClose={() => setEditTarget(null)}
            onSave={handleUpdate}
            loading={saving}
            apiError={error}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            coupon={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      {/* â”€â”€ Toast â”€â”€â”€ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            className={`fixed bottom-6 left-1/2 border text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 ${
              toast.ok
                ? "bg-muted border-[#c8fe1b]/20"
                : "bg-muted border-red-500/20"
            }`}
          >
            {toast.ok
              ? <Check size={14} className="text-[#c8fe1b]" />
              : <AlertTriangle size={14} className="text-red-400" />
            }
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
