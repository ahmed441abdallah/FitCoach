"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Using standard Helvetica font to avoid DataView RangeError caused by WOFF2 parsing issues

// ─── Types (mirror backend WorkoutPlan shape) ─────────────────────────────────
export interface WorkoutPlanExercise {
  exerciseId?: { _id?: string; name: string; bodyPart?: string } | null;
  sets: number;
  reps: number;
  restTimeMinutes?: number;
  notes?: string;
}

export interface WorkoutPlanDay {
  _id?: string;
  dayName: string;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutPlanData {
  _id?: string;
  planName: string;
  description?: string;
  notes?: string;
  days: WorkoutPlanDay[];
  /** Filled in by the caller from the auth/profile state */
  clientName?: string;
  coachName?: string;
  goal?: string;
}

// ─── Palette (Print-Friendly Graphite + Lime) ─────────────────────────────────
const C = {
  bg: "#FFFFFF",
  surface: "#F4F4F5", // zinc-100
  surfaceDark: "#E4E4E7", // zinc-200
  border: "#D4D4D8", // zinc-300
  primary: "#c8ff00", // Lime
  primaryDark: "#a3cc00", // Darker lime for borders
  text: "#090909", // Graphite
  textMuted: "#52525B", // zinc-600
  textDim: "#A1A1AA", // zinc-400
  white: "#FFFFFF",
  black: "#000000",
  headerBg: "#090909",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.bg,
    paddingHorizontal: 40,
    paddingTop: 0,
    paddingBottom: 44,
    fontSize: 10,
    color: C.text,
  },

  // Header (Dark for premium branding)
  header: {
    backgroundColor: C.headerBg,
    marginHorizontal: -40,
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandDot: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  brandDotInner: {
    width: 9,
    height: 9,
    borderRadius: 2,
    backgroundColor: C.headerBg,
  },
  brandName: {
    fontWeight: 700,
    fontSize: 20,
    color: C.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  brandTagline: {
    fontWeight: 400,
    fontSize: 7.5,
    color: C.primary,
    letterSpacing: 1.5,
    marginLeft: 30,
    marginTop: 2,
  },
  docLabel: {
    fontWeight: 400,
    fontSize: 8,
    color: C.textDim,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    textAlign: "right",
  },
  docDate: {
    fontWeight: 700,
    fontSize: 11,
    color: C.primary,
    textAlign: "right",
    marginTop: 3,
  },

  // Client card
  clientCard: {
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "stretch",
  },
  clientCol: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },
  clientSep: {
    width: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  clientLabel: {
    fontWeight: 400,
    fontSize: 7.5,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  clientValue: {
    fontWeight: 700,
    fontSize: 13,
    color: C.text,
    textTransform: "uppercase",
  },
  clientValueSm: {
    fontWeight: 600,
    fontSize: 10,
    color: C.text,
    textTransform: "uppercase",
  },
  activeBadge: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  activeBadgeText: {
    fontWeight: 700,
    fontSize: 7.5,
    color: C.black,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Summary bar
  summaryBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  summaryCell: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: C.text,
    padding: 10,
  },
  summaryCellLabel: {
    fontWeight: 400,
    fontSize: 7.5,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  summaryCellValue: {
    fontWeight: 700,
    fontSize: 16,
    color: C.text,
  },
  notesCell: {
    flex: 3,
    backgroundColor: C.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: C.primaryDark,
    padding: 10,
  },
  notesCellLabel: {
    fontWeight: 700,
    fontSize: 7.5,
    color: C.text,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  notesCellText: {
    fontWeight: 400,
    fontSize: 9,
    color: C.textMuted,
    lineHeight: 1.5,
  },

  // Section divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontWeight: 600,
    fontSize: 8,
    color: C.text,
    textTransform: "uppercase",
    letterSpacing: 2,
  },

  // Day block
  dayBlock: { marginBottom: 18 },
  dayHeader: {
    backgroundColor: C.text,
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  dayLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dayNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  dayNumText: { fontWeight: 700, fontSize: 10, color: C.black },
  dayName: { fontWeight: 700, fontSize: 11, color: C.white, textTransform: "uppercase", letterSpacing: 0.5 },
  dayCount: { fontWeight: 400, fontSize: 8, color: C.textDim },

  // Table
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.surfaceDark,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 2,
  },
  th: {
    fontWeight: 700,
    fontSize: 7,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  colNo: { width: 22 },
  colName: { flex: 1 },
  colPart: { width: 68 },
  colSets: { width: 36, textAlign: "center" },
  colReps: { width: 36, textAlign: "center" },
  colRest: { width: 44, textAlign: "center" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 5,
    marginBottom: 2,
  },
  rowEven: { backgroundColor: C.surface },
  rowOdd: { backgroundColor: C.bg },
  rowNo: { width: 22, fontWeight: 700, fontSize: 9, color: C.textDim },
  rowName: { flex: 1, fontWeight: 700, fontSize: 10, color: C.text, textTransform: "uppercase" },
  rowPart: {
    width: 68,
    fontWeight: 400,
    fontSize: 8,
    color: C.textMuted,
    textTransform: "uppercase",
  },
  statWrap: { width: 36, alignItems: "center" },
  statBadge: {
    backgroundColor: C.surfaceDark,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  statText: { fontWeight: 700, fontSize: 9, color: C.text },
  restWrap: { width: 44, alignItems: "center" },
  restText: { fontWeight: 400, fontSize: 8, color: C.textMuted },

  restDay: {
    padding: 12,
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  restDayText: { fontWeight: 700, fontSize: 10, color: C.textMuted, textTransform: "uppercase" },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    paddingVertical: 11,
    backgroundColor: C.headerBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerQuote: {
    fontWeight: 400,
    fontSize: 7.5,
    color: C.textDim,
  },
  footerCoach: { fontWeight: 700, fontSize: 9, color: C.white, marginBottom: 2, textTransform: "uppercase" },
  footerBrand: { fontWeight: 700, fontSize: 10, color: C.primary, textTransform: "uppercase", letterSpacing: 1 },
  footerPage: {
    fontWeight: 400,
    fontSize: 7.5,
    color: C.textDim,
    textAlign: "right",
    marginTop: 2,
  },
});

// ─── Stat Badge ───────────────────────────────────────────────────────────────
const StatBadge = ({ value }: { value: number }) => (
  <View style={s.statBadge}>
    <Text style={s.statText}>{value}</Text>
  </View>
);

// ─── Section Divider ──────────────────────────────────────────────────────────
const SectionDivider = ({ label }: { label: string }) => (
  <View style={s.divider}>
    <View style={s.dividerLine} />
    <Text style={s.dividerText}>{label}</Text>
    <View style={s.dividerLine} />
  </View>
);

// ─── PDF Document ─────────────────────────────────────────────────────────────
export const WorkoutPlanPDF = ({ plan }: { plan: WorkoutPlanData }) => {
  const totalExercises = plan.days.reduce(
    (acc, d) => acc + d.exercises.length,
    0
  );
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document
      title={`FitCoach - ${plan.planName}`}
      author="FitCoach Platform"
      creator="FitCoach"
    >
      <Page size="A4" style={s.page}>

        {/* HEADER */}
        <View style={s.header} fixed>
          <View>
            <View style={s.brandRow}>
              <View style={s.brandDot}>
                <View style={s.brandDotInner} />
              </View>
              <Text style={s.brandName}>FitCoach</Text>
            </View>
            <Text style={s.brandTagline}>PREMIUM FITNESS COACHING</Text>
          </View>
          <View>
            <Text style={s.docLabel}>Workout Plan</Text>
            <Text style={s.docDate}>{dateStr}</Text>
          </View>
        </View>

        {/* CLIENT INFO */}
        <View style={s.clientCard}>
          <View style={s.clientCol}>
            <Text style={s.clientLabel}>Client</Text>
            <Text style={s.clientValue}>{plan.clientName ?? "—"}</Text>
          </View>
          <View style={s.clientSep} />
          <View style={s.clientCol}>
            <Text style={s.clientLabel}>Goal</Text>
            <Text style={s.clientValueSm}>{plan.goal ?? "—"}</Text>
            <View style={s.activeBadge}>
              <Text style={s.activeBadgeText}>Active Plan</Text>
            </View>
          </View>
          <View style={s.clientSep} />
          <View style={s.clientCol}>
            <Text style={s.clientLabel}>Plan Name</Text>
            <Text style={s.clientValueSm}>{plan.planName}</Text>
          </View>
        </View>

        {/* SUMMARY BAR */}
        <View style={s.summaryBar}>
          <View style={s.summaryCell}>
            <Text style={s.summaryCellLabel}>Training Days</Text>
            <Text style={s.summaryCellValue}>{plan.days.length}</Text>
          </View>
          <View style={s.summaryCell}>
            <Text style={s.summaryCellLabel}>Total Exercises</Text>
            <Text style={s.summaryCellValue}>{totalExercises}</Text>
          </View>
          {(plan.notes || plan.description) && (
            <View style={s.notesCell}>
              <Text style={s.notesCellLabel}>
                {plan.notes ? "Coach Notes" : "Description"}
              </Text>
              <Text style={s.notesCellText}>
                {plan.notes ?? plan.description}
              </Text>
            </View>
          )}
        </View>

        {/* SCHEDULE */}
        <SectionDivider label="Weekly Training Schedule" />

        {plan.days.map((day, dayIdx) => (
          <View key={dayIdx} style={s.dayBlock} wrap={false}>
            {/* Day Header */}
            <View style={s.dayHeader}>
              <View style={s.dayLeft}>
                <View style={s.dayNumBadge}>
                  <Text style={s.dayNumText}>{dayIdx + 1}</Text>
                </View>
                <Text style={s.dayName}>{day.dayName}</Text>
              </View>
              <Text style={s.dayCount}>
                {day.exercises.length > 0
                  ? `${day.exercises.length} exercise${day.exercises.length > 1 ? "s" : ""}`
                  : "Rest Day"}
              </Text>
            </View>

            {day.exercises.length === 0 ? (
              <View style={s.restDay}>
                <Text style={s.restDayText}>Rest and Recovery Day</Text>
              </View>
            ) : (
              <>
                {/* Table Head */}
                <View style={s.tableHead}>
                  <Text style={[s.th, s.colNo]}>#</Text>
                  <Text style={[s.th, s.colName]}>Exercise</Text>
                  <Text style={[s.th, s.colPart]}>Body Part</Text>
                  <Text style={[s.th, s.colSets]}>Sets</Text>
                  <Text style={[s.th, s.colReps]}>Reps</Text>
                  <Text style={[s.th, s.colRest]}>Rest</Text>
                </View>

                {/* Rows */}
                {day.exercises.map((ex, exIdx) => (
                  <View
                    key={exIdx}
                    style={[s.row, exIdx % 2 === 0 ? s.rowEven : s.rowOdd]}
                  >
                    <Text style={s.rowNo}>{exIdx + 1}</Text>
                    <Text style={s.rowName}>
                      {ex.exerciseId?.name ?? "Unknown Exercise"}
                    </Text>
                    <Text style={s.rowPart}>
                      {ex.exerciseId?.bodyPart ?? "General"}
                    </Text>
                    <View style={s.statWrap}>
                      <StatBadge value={ex.sets} />
                    </View>
                    <View style={s.statWrap}>
                      <StatBadge value={ex.reps} />
                    </View>
                    <View style={s.restWrap}>
                      <Text style={s.restText}>
                        {ex.restTimeMinutes ? `${ex.restTimeMinutes} min` : "—"}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        ))}

        {/* FOOTER */}
        <View style={s.footer} fixed>
          <View>
            <Text style={s.footerCoach}>
              Coach: {plan.coachName ?? "FitCoach Team"}
            </Text>
            <Text style={s.footerQuote}>
              {`"The only bad workout is the one that didn't happen."`}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.footerBrand}>FitCoach</Text>
            <Text
              style={s.footerPage}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};
