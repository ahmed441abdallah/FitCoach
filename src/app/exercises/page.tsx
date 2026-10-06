"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Target,
  Layers,
  SlidersHorizontal,
  ArrowLeft,
  Play,
} from "lucide-react";
import { TransitionLink } from "@/components/layout/TransitionLink";
import Navbar from "@/components/layout/Navbar";
import { useTranslations } from "next-intl";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Exercise {
  _id: string;
  exerciseId: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  instructions: string[];
  secondaryMuscles: string[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Exercise[];
  pagination: Pagination;
}

import { API_BASE_URL } from "@/lib/config";
import Beams from "@/components/Beams";

// ─── Constants ────────────────────────────────────────────────────────────────

const BODY_PARTS = [
  "abdominals", "ankle stabilizers", "ankles", "biceps", "calves",
  "chest", "core", "deltoids", "forearms", "glutes", "hamstrings",
  "hands", "hip flexors", "latissimus dorsi", "lats", "lower back",
  "obliques", "quadriceps", "rhomboids", "rotator cuff", "shoulders",
  "soleus", "trapezius", "traps", "triceps", "upper back",
  "wrist extensors", "wrist flexors", "wrists",
];

const EQUIPMENTS = [
  "assisted", "band", "barbell", "body weight", "bosu ball",
  "cable", "dumbbell", "elliptical machine", "ez barbell", "hammer",
  "kettlebell", "leverage machine", "medicine ball", "olympic barbell",
  "resistance band", "roller", "rope", "skierg machine", "sled machine",
  "smith machine", "stability ball", "stationary bike", "stepmill machine",
  "tire", "trap bar", "upper body ergometer", "weighted", "wheel roller",
];

// ─── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  onClick,
}: {
  exercise: Exercise;
  onClick: () => void;
}) {
  const [gifLoaded, setGifLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass-card rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_28px_rgba(200,254,27,0.12)]"
    >
      {/* GIF Preview */}
      <div className="relative h-44 bg-foreground/5 overflow-hidden">
        {exercise.gifUrl ? (
          <>
            {!gifLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            )}
            {/* Static thumbnail — only animates on hover to save bandwidth */}
            <img
              src={hovered ? exercise.gifUrl : exercise.gifUrl}
              alt={exercise.name}
              onLoad={() => setGifLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${gifLoaded ? "opacity-100" : "opacity-0"
                } ${hovered ? "scale-105" : "scale-100"}`}
              loading="lazy"
            />
            {/* Overlay on hover */}
            <div
              className={`absolute inset-0 bg-primary/10 flex items-center justify-center transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                <Play size={16} className="text-black fill-black ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Dumbbell size={32} className="text-foreground/20" />
          </div>
        )}

        {/* Body part badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60  backdrop-blur-sm border border-primary/20">
            {exercise.bodyPart}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold uppercase tracking-wide text-sm text-black dark:text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug mb-2">
          {exercise.name}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] text-black/55 dark:text-muted-foreground uppercase tracking-wider">
            <Target size={9} className="text-primary" />
            {exercise.target}
          </span>
          <span className="text-black/25 dark:text-foreground/20 text-[10px]">·</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-black/55 dark:text-muted-foreground uppercase tracking-wider">
            <Layers size={9} className="text-primary/70" />
            {exercise.equipment}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// --- Exercise Modal ---
function ExerciseModal({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const t = useTranslations("exercises");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 28 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl flex flex-col md:flex-row shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
          style={{ background: "oklch(0.1 0.015 250)" }}
        >
          {/* Left: cinematic image panel */}
          <div
            className="relative md:w-[46%] flex-shrink-0 min-h-[300px] md:min-h-0 overflow-hidden"
            style={{ background: "oklch(0.07 0.01 250)" }}
          >
            {/* Grid texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: `linear-gradient(rgba(200,254,27,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,254,27,0.07) 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
              }}
            />
            {/* Glow behind image */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 90% 75% at 50% 55%, rgba(200,254,27,0.14) 0%, transparent 70%)",
              }}
            />

            {/* GIF with object-contain — never cropped */}
            {exercise.gifUrl ? (
              <img
                src={exercise.gifUrl}
                alt={exercise.name}
                className="absolute inset-0 w-full h-full object-contain p-8"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Dumbbell size={56} className="text-white/10" />
              </div>
            )}

            {/* Body-part badge */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] bg-primary text-black shadow-[0_0_20px_rgba(200,254,27,0.5)]">
                <Dumbbell size={9} />
                {exercise.bodyPart}
              </span>
            </div>

            {/* Right-edge separator */}
            <div className="hidden md:block absolute right-0 inset-y-0 w-px bg-white/[0.06]" />
          </div>

          {/* Right: content panel */}
          <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close exercise modal"
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all"
            >
              <X size={13} className="text-white/80" />
            </button>

            <div className="p-7 md:p-8 space-y-5 flex-1">
              {/* Label + name */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2 flex items-center gap-2">
                  <span className="inline-block w-5 h-px bg-primary" />
                  {t("exerciseGuide")}
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight pr-10">
                  {exercise.name}
                </h2>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/12 text-primary border border-primary/25">
                  <Target size={10} />
                  {exercise.target}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  <Layers size={10} />
                  {exercise.equipment}
                </span>
              </div>

              {/* Secondary muscles */}
              {exercise.secondaryMuscles?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 mb-2.5">
                    {t("alsoWorks")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.secondaryMuscles.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/4 border border-white/8 text-white/45"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-white/[0.07]" />

              {/* Instructions */}
              {exercise.instructions?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 mb-4">
                    {t("howToPerform")}
                  </p>
                  <ol className="space-y-4">
                    {exercise.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3.5">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/18 border border-primary/30 flex items-center justify-center text-[10px] font-extrabold text-primary mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-white/60 leading-relaxed normal-case font-normal tracking-normal">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Filter Chip ───────────────────────────────────────────────────────────────
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-200 whitespace-nowrap ${active
        ? "bg-primary text-black border-primary shadow-[0_0_12px_rgba(200,254,27,0.35)]"
        : "bg-black/5 dark:bg-foreground/5 text-black/60 dark:text-muted-foreground border-black/12 dark:border-foreground/10 hover:border-primary/50 hover:text-black dark:hover:text-foreground"
        }`}
    >
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExercisesPage() {
  const t = useTranslations("exercises");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [equipment, setEquipment] = useState("");
  const [page, setPage] = useState(1);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchExercises = useCallback(
    async (opts: {
      search?: string;
      bodyPart?: string;
      equipment?: string;
      page?: number;
    }) => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (opts.search) params.set("search", opts.search);
        if (opts.bodyPart) params.set("bodyPart", opts.bodyPart);
        if (opts.equipment) params.set("equipment", opts.equipment);
        params.set("page", String(opts.page ?? 1));
        params.set("limit", "30");

        const res = await fetch(`${API_BASE_URL}/exercises?${params}`);
        if (!res.ok) throw new Error("Failed to fetch exercises");
        const json: ApiResponse = await res.json();
        setExercises(json.data);
        setPagination(json.pagination);
      } catch {
        setError("Could not load exercises. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchExercises({ search, bodyPart, equipment, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchExercises({ search: val, bodyPart, equipment, page: 1 });
    }, 400);
  };

  // Filter change
  const applyFilter = (
    newBodyPart: string,
    newEquipment: string,
    newPage = 1
  ) => {
    setPage(newPage);
    fetchExercises({ search, bodyPart: newBodyPart, equipment: newEquipment, page: newPage });
  };

  const handleBodyPartChange = (val: string) => {
    const next = bodyPart === val ? "" : val;
    setBodyPart(next);
    applyFilter(next, equipment);
  };

  const handleEquipmentChange = (val: string) => {
    const next = equipment === val ? "" : val;
    setEquipment(next);
    applyFilter(bodyPart, next);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchExercises({ search, bodyPart, equipment, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAll = () => {
    setSearch("");
    setBodyPart("");
    setEquipment("");
    setPage(1);
    fetchExercises({ page: 1 });
    searchRef.current?.focus();
  };

  const activeFiltersCount = [search, bodyPart, equipment].filter(Boolean).length;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        {/* ── Page Header ─────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 px-6 border-b border-foreground/[0.06]">
          {/* Beams Background */}
          <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
            <Beams
              beamWidth={4}
              beamHeight={35}
              beamNumber={25}
              lightColor="#888888"
              speed={1.5}
              noiseIntensity={1.5}
              scale={0.2}
              rotation={25}
              beamColor="#333333"
              backgroundColor="#0a0a12"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <TransitionLink
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-primary transition-colors mb-10 group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              {t("backToHome")}
            </TransitionLink>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                {/* Icon Badge */}
                <div className="flex-shrink-0 w-16 h-16 rounded-full border border-primary/20 bg-[#c8fe1b]/5 flex items-center justify-center text-primary mt-1">
                  <Dumbbell size={24} className="text-primary" />
                </div>

                {/* Text Content */}
                <div>
                  <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <span className="inline-block w-5 h-px bg-primary" />
                    {t("title")}
                  </p>
                  <h1 className="text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-white leading-none drop-shadow-xl mb-3">
                    1300+ <span className="text-primary">{t("title")}</span>
                  </h1>
                  <p className="text-white/60 text-sm normal-case font-normal tracking-normal max-w-lg">
                    {t("filter")} {t("bodyPart")}, {t("equipment")}.
                  </p>
                </div>
              </div>

              {pagination && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-sm font-bold text-white/70">
                  <Dumbbell size={14} className="text-primary" />
                  <span>
                    {pagination.total.toLocaleString()}{" "}
                    <span className="text-white">{t("results")}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Controls ────────────────────────────────────────── */}
        <section className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-foreground/[0.06] px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                ref={searchRef}
                id="exercise-search"
                type="text"
                placeholder={t("search")}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-foreground/10 bg-foreground/5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all normal-case font-normal tracking-normal"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              id="toggle-filters-btn"
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all duration-200 ${showFilters || activeFiltersCount > 0
                ? "bg-primary text-black border-primary"
                : "border-black/12 dark:border-foreground/10 bg-black/5 dark:bg-foreground/5 text-black/70 dark:text-muted-foreground hover:border-primary/50"
                }`}
            >
              <SlidersHorizontal size={13} />
              {t("filter")}
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-black/20 text-[9px] font-extrabold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <X size={11} /> {t("clear")}
              </button>
            )}
          </div>

          {/* Expandable filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="max-w-7xl mx-auto pt-3 space-y-3">
                  {/* Body Part */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Dumbbell size={9} className="text-primary" />
                      {t("bodyPart")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {BODY_PARTS.map((bp) => (
                        <FilterChip
                          key={bp}
                          label={bp}
                          active={bodyPart === bp}
                          onClick={() => handleBodyPartChange(bp)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Layers size={9} className="text-primary/70" />
                      {t("equipment")}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {EQUIPMENTS.map((eq) => (
                        <FilterChip
                          key={eq}
                          label={eq}
                          active={equipment === eq}
                          onClick={() => handleEquipmentChange(eq)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Grid ────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="h-44 bg-foreground/5" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-foreground/5 rounded-full w-4/5" />
                    <div className="h-2.5 bg-foreground/5 rounded-full w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <X size={28} className="text-destructive" />
              </div>
              <p className="text-destructive font-semibold">{error}</p>
              <button
                onClick={() => fetchExercises({ search, bodyPart, equipment, page })}
                className="px-4 py-2 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider"
              >
                {t("retry")}
              </button>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                <Dumbbell size={28} className="text-foreground/30" />
              </div>
              <p className="text-muted-foreground font-semibold">
                {t("noResults")}
              </p>
              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-xl bg-primary/15 border border-primary/25 text-primary font-bold text-sm uppercase tracking-wider hover:bg-primary/25 transition-colors"
              >
                {t("clearFilters")}
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {exercises.map((ex) => (
                  <ExerciseCard
                    key={ex._id}
                    exercise={ex}
                    onClick={() => setSelected(ex)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Pagination ────────────────────────────────────── */}
          {pagination && pagination.totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                id="prev-page-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPreviousPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/12 dark:border-foreground/10 bg-black/5 dark:bg-foreground/5 text-sm font-bold uppercase tracking-wider text-black/60 dark:text-muted-foreground disabled:opacity-30 hover:border-primary/50 hover:text-primary transition-all"
              >
                <ChevronLeft size={14} /> {t("prev")}
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
                  const start = Math.max(1, Math.min(page - 3, pagination.totalPages - 6));
                  const p = start + i;
                  if (p > pagination.totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${p === page
                        ? "bg-primary text-black shadow-[0_0_14px_rgba(200,254,27,0.4)]"
                        : "text-black/50 dark:text-muted-foreground hover:bg-black/5 dark:hover:bg-foreground/5 hover:text-black dark:hover:text-foreground"
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                id="next-page-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/12 dark:border-foreground/10 bg-black/5 dark:bg-foreground/5 text-sm font-bold uppercase tracking-wider text-black/60 dark:text-muted-foreground disabled:opacity-30 hover:border-primary/50 hover:text-primary transition-all"
              >
                {t("next")} <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Page info */}
          {pagination && !loading && (
            <p className="text-center text-xs text-muted-foreground mt-4 normal-case font-normal tracking-normal">
              {t("pageInfo", { page: pagination.page, totalPages: pagination.totalPages, total: pagination.total })}
            </p>
          )}
        </section>
      </main>

      {/* ── Exercise Detail Modal ──────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
