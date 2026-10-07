"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Image as ImageIcon,
  Landmark,
  Receipt,
  ShieldCheck,
  Tag,
  UploadCloud,
  X,
  Wallet,
  Loader2,
} from "lucide-react";
import { TransitionLink } from "@/components/layout/TransitionLink";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getPackages } from "@/lib/features/packages/packageSlice";
import axiosInstance from "@/lib/axios";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const optionId = searchParams.get("optionId");

  const dispatch = useAppDispatch();
  const { packages, loading } = useAppSelector((state) => state.package);
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Guard: redirect to login if not authenticated, to /get-started if no profile
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Clear pending plan fallback since we have successfully reached checkout
    sessionStorage.removeItem("pendingCheckoutPlan");

    axiosInstance.get("/clients/me").catch(() => {
      router.push("/get-started");
    });
  }, [user, router]);

  // Fetch packages if not already loaded in Redux
  useEffect(() => {
    if (!packages || packages.length === 0) {
      dispatch(getPackages());
    }
  }, [dispatch, packages]);

  // Find the selected package and option based on URL parameters
  const selectedData = useMemo(() => {
    if (!packages || packages.length === 0) return null;
    const pkg = packages.find((p: any) => p._id === packageId);
    if (!pkg) return null;
    const opt = pkg.pricingOptions?.find((o: any) => o._id === optionId);
    if (!opt) return null;

    return {
      name: pkg.name,
      durationInMonths: opt.durationInMonths,
      originalPrice: opt.price,
    };
  }, [packages, packageId, optionId]);

  const [coupon, setCoupon] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "vodafone" | "bank" | "">("");
  const [fileHover, setFileHover] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  // Helper to clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async () => {
    if (!paymentMethod || !file || !selectedData) return;
    
    setIsSubmitting(true);
    setToast(null);

    try {
      const formData = new FormData();
      formData.append("packageId", packageId!);
      formData.append("pricingOptionId", optionId!);
      formData.append("paymentMethod", paymentMethod);
      if (isCouponApplied && coupon) {
        formData.append("couponCode", coupon);
      }
      formData.append("paymentProof", file);

      const response = await axiosInstance.post("/subscriptions", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setToast({ message: "Subscription requested successfully! Awaiting admin approval.", type: "success" });
        setTimeout(() => router.push("/profile"), 2000);
      }
    } catch (error: any) {
      const errRes = error.response?.data;
      
      if (errRes?.requiresOnboarding) {
        setToast({ message: errRes.message || "Please complete your profile first.", type: "warning" });
        setTimeout(() => router.push("/get-started"), 2000);
      } else if (errRes?.message) {
        setToast({ message: errRes.message, type: "error" });
      } else {
        setToast({ message: "An unexpected error occurred. Please try again.", type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (loading && !selectedData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-white/50 text-sm font-semibold uppercase tracking-widest">Loading details...</p>
      </div>
    );
  }

  // Not Found State
  if (!loading && !selectedData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6">
          <X size={28} className="text-destructive" />
        </div>
        <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white mb-2">Package Not Found</h2>
        <p className="text-white/50 text-sm normal-case font-normal mb-8">The plan you selected doesn't exist or is currently unavailable.</p>
        <TransitionLink 
          href="/#plans" 
          className="px-6 py-3 rounded-xl bg-primary text-black font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(200,254,27,0.3)] transition-all"
        >
          View All Plans
        </TransitionLink>
      </div>
    );
  }

  // Static Calculation for UI based on real data
  const discountAmount = isCouponApplied ? (selectedData!.originalPrice * 0.2) : 0; // Dummy 20% discount logic
  const finalPrice = Math.max(0, selectedData!.originalPrice - discountAmount);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      {/* ── Left Column: Form & Payment ────────────────────────────── */}
      <div className="lg:col-span-7 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white mb-2">
            Checkout
          </h1>
          <p className="text-white/50 normal-case font-normal tracking-normal text-sm">
            Complete your payment to activate your {selectedData!.name} plan.
          </p>
        </motion.div>

        {/* Payment Method Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <span className="w-4 h-px bg-primary" />
            Select Payment Method
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setPaymentMethod("instapay")}
              className={`relative p-5 rounded-2xl border text-left transition-all duration-300 ${
                paymentMethod === "instapay"
                  ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(200,254,27,0.15)]"
                  : "bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]"
              }`}
            >
              <Landmark size={24} className={`mb-3 ${paymentMethod === "instapay" ? "text-primary" : "text-white/40"}`} />
              <p className={`font-bold uppercase tracking-wider text-sm ${paymentMethod === "instapay" ? "text-white" : "text-white/70"}`}>
                Instapay
              </p>
              {paymentMethod === "instapay" && (
                <CheckCircle2 size={16} className="absolute top-4 right-4 text-primary" />
              )}
            </button>

            <button
              onClick={() => setPaymentMethod("vodafone")}
              className={`relative p-5 rounded-2xl border text-left transition-all duration-300 ${
                paymentMethod === "vodafone"
                  ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(200,254,27,0.15)]"
                  : "bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]"
              }`}
            >
              <Wallet size={24} className={`mb-3 ${paymentMethod === "vodafone" ? "text-primary" : "text-white/40"}`} />
              <p className={`font-bold uppercase tracking-wider text-sm ${paymentMethod === "vodafone" ? "text-white" : "text-white/70"}`}>
                Vodafone Cash
              </p>
              {paymentMethod === "vodafone" && (
                <CheckCircle2 size={16} className="absolute top-4 right-4 text-primary" />
              )}
            </button>

            <button
              onClick={() => setPaymentMethod("bank")}
              className={`relative p-5 rounded-2xl border text-left transition-all duration-300 ${
                paymentMethod === "bank"
                  ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(200,254,27,0.15)]"
                  : "bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.04]"
              }`}
            >
              <CreditCard size={24} className={`mb-3 ${paymentMethod === "bank" ? "text-primary" : "text-white/40"}`} />
              <p className={`font-bold uppercase tracking-wider text-sm ${paymentMethod === "bank" ? "text-white" : "text-white/70"}`}>
                Bank Transfer
              </p>
              {paymentMethod === "bank" && (
                <CheckCircle2 size={16} className="absolute top-4 right-4 text-primary" />
              )}
            </button>
          </div>

          {/* Payment Instructions based on method */}
          <AnimatePresence mode="wait">
            {paymentMethod && (
              <motion.div
                key={paymentMethod}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 mt-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
                    Transfer Details
                  </p>
                  {paymentMethod === "instapay" && (
                    <p className="text-sm text-white/80 normal-case font-normal">
                      Please transfer exactly <strong className="text-primary">{finalPrice} EGP</strong> to the Instapay address: <span className="font-mono bg-black/50 px-2 py-1 rounded text-white select-all">fitcoach@instapay</span>
                    </p>
                  )}
                  {paymentMethod === "vodafone" && (
                    <p className="text-sm text-white/80 normal-case font-normal">
                      Please transfer exactly <strong className="text-primary">{finalPrice} EGP</strong> to the Vodafone Cash number: <span className="font-mono bg-black/50 px-2 py-1 rounded text-white select-all">01012345678</span>
                    </p>
                  )}
                  {paymentMethod === "bank" && (
                    <p className="text-sm text-white/80 normal-case font-normal">
                      Transfer <strong className="text-primary">{finalPrice} EGP</strong> to Bank Account: <br />
                      <span className="font-mono bg-black/50 px-2 py-1 rounded text-white select-all mt-2 inline-block">EG980000000000000000000</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Payment Proof Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <span className="w-4 h-px bg-primary" />
            Payment Proof
          </h2>
          <div 
            onDragOver={(e) => { e.preventDefault(); setFileHover(true); }}
            onDragLeave={() => setFileHover(false)}
            onDrop={(e) => {
              e.preventDefault();
              setFileHover(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
              }
            }}
            className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
              fileHover 
                ? "border-primary bg-primary/5" 
                : file 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
          >
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
              }}
            />
            
            {file ? (
              <div className="flex flex-col items-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                  <ImageIcon size={28} />
                </div>
                <p className="text-sm font-bold text-white mb-1">{file.name}</p>
                <p className="text-xs text-white/50 normal-case font-normal">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Click to replace
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/40">
                  <UploadCloud size={28} />
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-white mb-1">
                  Upload Receipt
                </p>
                <p className="text-xs text-white/40 normal-case font-normal max-w-[250px]">
                  Drag and drop your payment screenshot here, or click to browse files (PNG, JPG, PDF)
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Right Column: Order Summary ──────────────────────────── */}
      <div className="lg:col-span-5">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="sticky top-28 rounded-3xl bg-white/[0.03] border border-white/10 p-1 overflow-hidden"
        >
          {/* Inner container with noise texture */}
          <div className="relative rounded-[20px] bg-black p-8 overflow-hidden h-full">
            {/* Decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[60px] pointer-events-none" />
            
            <h3 className="text-xl font-extrabold uppercase tracking-tight text-white mb-8 flex items-center gap-3">
              <Receipt className="text-primary" size={20} />
              Order Summary
            </h3>

            {/* Package Details */}
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                  Selected Plan
                </p>
                <p className="text-2xl font-extrabold uppercase tracking-wide text-white">
                  {selectedData!.name}
                </p>
                <p className="text-xs text-white/50 normal-case font-normal">
                  {selectedData!.durationInMonths} Months Access
                </p>
              </div>
              <p className="text-lg font-bold text-white flex flex-col items-end">
                <span>{selectedData!.originalPrice}</span> 
                <span className="text-[10px] text-white/40 uppercase tracking-widest">EGP</span>
              </p>
            </div>

            <div className="h-px w-full bg-white/10 mb-6" />

            {/* Coupon Code Section */}
            <div className="mb-6 relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
                <Tag size={10} /> Promo Code
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  disabled={isCouponApplied}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm uppercase font-bold tracking-wider text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 disabled:opacity-50"
                />
                {!isCouponApplied ? (
                  <button 
                    onClick={() => coupon && setIsCouponApplied(true)}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Apply
                  </button>
                ) : (
                  <button 
                    onClick={() => { setIsCouponApplied(false); setCoupon(""); }}
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive px-5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <AnimatePresence>
                {isCouponApplied && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-xs text-primary mt-2 font-bold flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle2 size={12} /> Coupon Applied (-20%)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-px w-full bg-white/10 mb-6" />

            {/* Price Breakdown */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white font-medium">{selectedData!.originalPrice} EGP</span>
              </div>
              {isCouponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-primary/70">Discount</span>
                  <span className="text-primary font-medium">-{discountAmount} EGP</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-3">
                <span className="text-white/70 font-bold uppercase tracking-wider text-sm">Total Due</span>
                <span className="text-4xl font-extrabold text-white leading-none">
                  {finalPrice} <span className="text-lg text-white/50">EGP</span>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!paymentMethod || !file || isSubmitting}
              className="w-full relative group overflow-hidden rounded-xl bg-primary text-black py-4 px-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(200,254,27,0.3)]"
            >
              <div className="relative z-10 flex items-center justify-center gap-2 font-bold uppercase tracking-[0.2em] text-sm">
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Confirm Payment
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
            
            <p className="text-[10px] text-center text-white/30 mt-4 normal-case font-normal max-w-[250px] mx-auto">
              By confirming, you agree to our terms. Your request will be reviewed by an admin.
            </p>
          </div>
        </motion.div>
      </div>

    </div>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              toast.type === "success" ? "bg-primary/10 border-primary text-primary backdrop-blur-md" :
              toast.type === "warning" ? "bg-amber-400/10 border-amber-400 text-amber-400 backdrop-blur-md" :
              "bg-destructive/10 border-destructive text-destructive backdrop-blur-md"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={24} /> : <X size={24} />}
            <p className="font-bold uppercase tracking-wider text-sm">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-20 selection:bg-primary/30">
      {/* ── Background Elements ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <TransitionLink
          href="/#plans"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-primary transition-colors mb-10 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Plans
        </TransitionLink>

        {/* Suspense is required when using useSearchParams in Next.js App Router */}
        <Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-white/50 text-sm font-semibold uppercase tracking-widest">Loading details...</p>
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </div>
    </main>
  );
}
