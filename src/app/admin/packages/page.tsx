"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "@/lib/features/packages/packageSlice";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Box,
  DollarSign,
  Clock,
  Layers,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PricingOption {
  _id?: string;
  durationInMonths: number;
  price: number;
}

interface Package {
  _id: string;
  name: string;
  description: string[];
  pricingOptions: PricingOption[];
}

// â”€â”€â”€ Package form initial state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const emptyForm = () => ({
  name: "",
  description: [""],
  pricingOptions: [{ durationInMonths: 1, price: 0 }] as PricingOption[],
});

const TIER_COLORS: Record<string, string> = {
  Starter: "from-sky-900/40 to-sky-950/80 border-sky-500/20",
  Core: "from-violet-900/40 to-violet-950/80 border-violet-500/20",
  Pro: "from-[#c8fe1b]/5 to-background/80 border-[#c8fe1b]/20",
};
const BADGE_COLORS: Record<string, string> = {
  Starter: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  Core: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  Pro: "bg-[#c8fe1b]/10 text-[#c8fe1b] border-[#c8fe1b]/20",
};

// â”€â”€â”€ Confirm Delete Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DeleteModal({ pkg, onConfirm, onCancel, loading }: {
  pkg: Package;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            <h3 className="text-white font-extrabold uppercase tracking-tight">Delete Package</h3>
            <p className="text-white/40 text-xs mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-6">
          Are you sure you want to delete <span className="text-white font-bold">"{pkg.name}"</span>? All associated pricing tiers will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white text-sm font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 border border-red-500 text-white text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Create / Edit Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PackageModal({ pkg, onClose, onSave, loading }: {
  pkg: ReturnType<typeof emptyForm> & { _id?: string };
  onClose: () => void;
  onSave: (data: any) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState(pkg);

  const setName = (v: string) => setForm((f) => ({ ...f, name: v }));

  const setDesc = (idx: number, val: string) =>
    setForm((f) => ({ ...f, description: f.description.map((d, i) => i === idx ? val : d) }));
  const addDesc = () => setForm((f) => ({ ...f, description: [...f.description, ""] }));
  const removeDesc = (idx: number) =>
    setForm((f) => ({ ...f, description: f.description.filter((_, i) => i !== idx) }));

  const setPricing = (idx: number, field: "durationInMonths" | "price", val: number) =>
    setForm((f) => ({
      ...f,
      pricingOptions: f.pricingOptions.map((p, i) => i === idx ? { ...p, [field]: val } : p),
    }));
  const addPricing = () =>
    setForm((f) => ({ ...f, pricingOptions: [...f.pricingOptions, { durationInMonths: 1, price: 0 }] }));
  const removePricing = (idx: number) =>
    setForm((f) => ({ ...f, pricingOptions: f.pricingOptions.filter((_, i) => i !== idx) }));

  const isEdit = !!pkg._id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-white/[0.09] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center">
              {isEdit ? <Pencil size={15} className="text-[#c8fe1b]" /> : <Plus size={15} className="text-[#c8fe1b]" />}
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{isEdit ? "Edit Package" : "New Package"}</p>
              <h3 className="text-white font-extrabold uppercase tracking-tight">{isEdit ? form.name || "Package" : "Create Package"}</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-white/40 hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Form body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Package Name</label>
            <input
              value={form.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pro, Starter, Core..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8fe1b]/40 transition-all normal-case font-medium tracking-normal"
            />
          </div>

          {/* Description / Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Features</label>
              <button onClick={addDesc} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#c8fe1b] hover:text-lime-300 transition-colors">
                <Plus size={10} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.description.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[#c8fe1b] text-xs flex-shrink-0">âœ“</span>
                  <input
                    value={d}
                    onChange={(e) => setDesc(idx, e.target.value)}
                    placeholder={`Feature ${idx + 1}`}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c8fe1b]/40 transition-all normal-case font-normal tracking-normal"
                  />
                  {form.description.length > 1 && (
                    <button onClick={() => removeDesc(idx)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Tiers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Pricing Tiers</label>
              <button onClick={addPricing} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#c8fe1b] hover:text-lime-300 transition-colors">
                <Plus size={10} /> Add Tier
              </button>
            </div>
            <div className="space-y-2">
              {form.pricingOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <div className="flex-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/30 block mb-1">Duration (months)</label>
                    <input
                      type="number"
                      min={1}
                      value={opt.durationInMonths}
                      onChange={(e) => setPricing(idx, "durationInMonths", Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white text-sm focus:outline-none focus:border-[#c8fe1b]/40 transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-white/30 block mb-1">Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={opt.price}
                      onChange={(e) => setPricing(idx, "price", Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white text-sm focus:outline-none focus:border-[#c8fe1b]/40 transition-all"
                    />
                  </div>
                  {form.pricingOptions.length > 1 && (
                    <button onClick={() => removePricing(idx)} className="mt-5 w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0">
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.07] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/60 hover:text-white text-sm font-bold uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.name.trim()}
            className="flex-1 py-3 rounded-xl bg-[#c8fe1b] hover:bg-lime-300 text-black text-sm font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(200,254,27,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isEdit ? "Save Changes" : "Create Package"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Package Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PackageCard({ pkg, onEdit, onDelete }: {
  pkg: Package;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const gradient = TIER_COLORS[pkg.name] || "from-muted/60 to-card/80 border-white/10";
  const badge = BADGE_COLORS[pkg.name] || "bg-white/10 text-white/60 border-white/10";
  const lowestPrice = Math.min(...pkg.pricingOptions.map((o) => o.price));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${gradient} border rounded-2xl overflow-hidden group`}
    >
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-2 ${badge}`}>
              {pkg.name}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">${lowestPrice}</span>
              <span className="text-white/30 text-xs font-semibold">/mo+</span>
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-[#c8fe1b]/15 border border-white/[0.08] hover:border-[#c8fe1b]/30 flex items-center justify-center text-white/40 hover:text-[#c8fe1b] transition-all"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-red-500/15 border border-white/[0.08] hover:border-red-500/30 flex items-center justify-center text-white/40 hover:text-red-400 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Pricing tiers */}
        <div className="flex flex-wrap gap-2 mb-4">
          {pkg.pricingOptions.map((opt) => (
            <div key={opt._id || opt.durationInMonths} className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5">
              <Clock size={10} className="text-white/30" />
              <span className="text-white text-xs font-bold">{opt.durationInMonths}mo</span>
              <span className="text-white/30 text-[10px]">-</span>
              <DollarSign size={9} className="text-[#c8fe1b]" />
              <span className="text-[#c8fe1b] text-xs font-extrabold">{opt.price}</span>
            </div>
          ))}
        </div>

        {/* Features toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-[10px] font-bold uppercase tracking-wider transition-colors"
        >
          <Layers size={11} />
          {pkg.description.length} Features
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {/* Expanded features */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-2">
              {pkg.description.map((d, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-[#c8fe1b] text-xs flex-shrink-0 mt-0.5"> -</span>
                  <p className="text-white/60 text-xs font-normal normal-case tracking-normal leading-snug">{d}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminPackagesPage() {
  const dispatch = useAppDispatch();
  const { packages, loading } = useAppSelector((s) => s.package);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { dispatch(getPackages()); }, [dispatch]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = useCallback(async (data: any) => {
    setSaving(true);
    try {
      await dispatch(createPackage(data)).unwrap();
      setShowCreate(false);
      showToast("Package created successfully!");
    } catch {
      showToast("Failed to create package.");
    } finally { setSaving(false); }
  }, [dispatch]);

  const handleUpdate = useCallback(async (data: any) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await dispatch(updatePackage({ id: editTarget._id, data })).unwrap();
      setEditTarget(null);
      showToast("Package updated successfully!");
    } catch {
      showToast("Failed to update package.");
    } finally { setSaving(false); }
  }, [dispatch, editTarget]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deletePackage(deleteTarget._id)).unwrap();
      setDeleteTarget(null);
      showToast("Package deleted.");
    } catch {
      showToast("Failed to delete package.");
    } finally { setDeleting(false); }
  }, [dispatch, deleteTarget]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* â”€â”€ Header â”€â”€â”€ */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[#c8fe1b] text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
            <span className="w-4 h-px bg-[#c8fe1b]" /> Management
          </p>
          <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight leading-none">
            Packages
          </h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8fe1b] text-black text-sm font-bold uppercase tracking-wider hover:bg-lime-300 hover:shadow-[0_0_20px_rgba(200,254,27,0.4)] transition-all"
        >
          <Plus size={16} /> New Package
        </motion.button>
      </div>

      {/* â”€â”€ Summary bar â”€â”€â”€ */}
      <div className="flex items-center gap-6 bg-card border border-white/[0.07] rounded-2xl px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 flex items-center justify-center">
            <Box size={16} className="text-[#c8fe1b]" />
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Total Packages</p>
            <p className="text-white text-xl font-extrabold leading-none">{packages.length}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Layers size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Pricing Tiers</p>
            <p className="text-white text-xl font-extrabold leading-none">
              {packages.reduce((acc, p: any) => acc + (p.pricingOptions?.length || 0), 0)}
            </p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Lowest Price</p>
            <p className="text-white text-xl font-extrabold leading-none">
              ${packages.length
                ? Math.min(...packages.flatMap((p: any) => p.pricingOptions?.map((o: any) => o.price) || [0]))
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* â”€â”€ Loading State â”€â”€â”€ */}
      {loading && packages.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="text-[#c8fe1b] animate-spin" />
        </div>
      )}

      {/* â”€â”€ Package Cards â”€â”€â”€ */}
      {!loading || packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {(packages as Package[]).map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                onEdit={() => setEditTarget(pkg)}
                onDelete={() => setDeleteTarget(pkg)}
              />
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {packages.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-24 text-center"
            >
              <Box size={48} className="text-white/10 mb-4" />
              <p className="text-white/30 font-bold uppercase tracking-wider text-sm">No packages yet</p>
              <p className="text-white/15 text-xs mt-1 mb-6">Create your first package to get started</p>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8fe1b]/10 border border-[#c8fe1b]/20 text-[#c8fe1b] text-sm font-bold uppercase tracking-wider hover:bg-[#c8fe1b]/20 transition-all"
              >
                <Plus size={14} /> Create Package
              </button>
            </motion.div>
          )}
        </div>
      ) : null}

      {/* â”€â”€ Modals â”€â”€â”€ */}
      <AnimatePresence>
        {showCreate && (
          <PackageModal
            pkg={emptyForm()}
            onClose={() => setShowCreate(false)}
            onSave={handleCreate}
            loading={saving}
          />
        )}
        {editTarget && (
          <PackageModal
            pkg={{
              _id: editTarget._id,
              name: editTarget.name,
              description: editTarget.description || [""],
              pricingOptions: editTarget.pricingOptions || [{ durationInMonths: 1, price: 0 }],
            }}
            onClose={() => setEditTarget(null)}
            onSave={handleUpdate}
            loading={saving}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            pkg={deleteTarget}
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
            className="fixed bottom-6 left-1/2 bg-muted border border-[#c8fe1b]/20 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2"
          >
            <Check size={14} className="text-[#c8fe1b]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
