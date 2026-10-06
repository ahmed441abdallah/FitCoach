"use client";

import { usePDF } from "@react-pdf/renderer";
import { WorkoutPlanPDF } from "./WorkoutPlanPDF";
import type { WorkoutPlanData } from "./WorkoutPlanPDF";
import { Download, Loader2, FileText } from "lucide-react";

interface DownloadPlanBtnProps {
  plan: WorkoutPlanData;
  label?: string;
  className?: string;
}

export default function DownloadPlanBtn({
  plan,
  label = "Download PDF",
  className = "",
}: DownloadPlanBtnProps) {
  const [instance] = usePDF({ document: <WorkoutPlanPDF plan={plan} /> });

  const fileName =
    "FitCoach_Workout_" +
    (plan.clientName?.replace(/\s+/g, "_") ?? "Plan") +
    "_" +
    plan.planName.replace(/\s+/g, "_") +
    ".pdf";

  if (instance.error) {
    return (
      <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
        <FileText size={13} />
        PDF Error
      </span>
    );
  }

  if (instance.loading || !instance.url) {
    return (
      <button type="button" disabled className={"flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm tracking-wide cursor-not-allowed bg-primary/20 border-primary/30 text-primary/70 " + className}>
        <Loader2 size={14} className="animate-spin flex-shrink-0" />
        <span>Generating...</span>
      </button>
    );
  }

  return (
    <a href={instance.url} download={fileName} className={"group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/50 font-bold text-sm tracking-wide no-underline cursor-pointer bg-primary text-black hover:bg-primary/90 shadow-[0_0_18px_rgba(200,254,27,0.2)] hover:shadow-[0_0_28px_rgba(200,254,27,0.4)] transition-all duration-200 " + className}>
      <Download size={14} className="flex-shrink-0 transition-transform duration-150 group-hover:translate-y-0.5" />
      <span>{label}</span>
    </a>
  );
}
