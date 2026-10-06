"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Using standard Helvetica font to avoid DataView RangeError caused by WOFF2 parsing issues

// ─── Types ───────────────────────────────────────────────────────────────────
export interface DietPlanMealItem {
  _id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietPlanMeal {
  _id?: string;
  mealName: string;
  mealDescription?: string;
  mealItems: DietPlanMealItem[];
}

export interface DietPlanData {
  _id?: string;
  description?: string;
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: DietPlanMeal[];
  /** Filled in by caller */
  clientName?: string;
  coachName?: string;
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

  // Macros bar
  macroBar: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  macroCell: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 8,
    borderLeftWidth: 3,
    padding: 10,
  },
  macroLabel: {
    fontWeight: 400,
    fontSize: 7.5,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  macroValue: {
    fontWeight: 700,
    fontSize: 16,
    color: C.text,
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

  // Meal block
  mealBlock: { marginBottom: 18 },
  mealHeader: {
    backgroundColor: C.text,
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  mealLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  mealNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  mealNumText: { fontWeight: 700, fontSize: 10, color: C.black },
  mealName: { fontWeight: 700, fontSize: 11, color: C.white, textTransform: "uppercase", letterSpacing: 0.5 },
  mealCount: { fontWeight: 400, fontSize: 8, color: C.textDim },

  mealDescBox: {
    backgroundColor: C.surface,
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginBottom: 5,
    borderLeftWidth: 2,
    borderLeftColor: C.primary,
  },
  mealDescText: {
    fontSize: 8,
    color: C.textMuted,
    lineHeight: 1.4,
  },

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
  colName: { flex: 2 },
  colCal: { flex: 1, textAlign: "center" },
  colMac: { flex: 1, textAlign: "center" },

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
  rowName: { flex: 2, fontWeight: 700, fontSize: 10, color: C.text },
  statWrap: { flex: 1, alignItems: "center" },
  statBadge: {
    backgroundColor: C.surfaceDark,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 32,
    alignItems: "center",
  },
  statText: { fontWeight: 700, fontSize: 9, color: C.text },

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

const SectionDivider = ({ label }: { label: string }) => (
  <View style={s.divider}>
    <View style={s.dividerLine} />
    <Text style={s.dividerText}>{label}</Text>
    <View style={s.dividerLine} />
  </View>
);

// ─── PDF Document ─────────────────────────────────────────────────────────────
export const DietPlanPDF = ({ plan }: { plan: DietPlanData }) => {
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document
      title={`FitCoach - Diet Plan`}
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
            <Text style={s.docLabel}>Diet Plan</Text>
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
            <Text style={s.clientLabel}>Status</Text>
            <View style={s.activeBadge}>
              <Text style={s.activeBadgeText}>Active Diet</Text>
            </View>
          </View>
          <View style={s.clientSep} />
          <View style={s.clientCol}>
            <Text style={s.clientLabel}>Description</Text>
            <Text style={s.clientValueSm}>{plan.description ?? "Personalized Nutrition"}</Text>
          </View>
        </View>

        {/* MACROS BAR */}
        <View style={s.macroBar}>
          <View style={[s.macroCell, { borderLeftColor: C.text }]}>
            <Text style={s.macroLabel}>Calories</Text>
            <Text style={s.macroValue}>{plan.totalCalories} kcal</Text>
          </View>
          <View style={[s.macroCell, { borderLeftColor: "#34d399" }]}>
            <Text style={s.macroLabel}>Protein</Text>
            <Text style={s.macroValue}>{plan.macros?.protein ?? 0}g</Text>
          </View>
          <View style={[s.macroCell, { borderLeftColor: "#f97316" }]}>
            <Text style={s.macroLabel}>Carbs</Text>
            <Text style={s.macroValue}>{plan.macros?.carbs ?? 0}g</Text>
          </View>
          <View style={[s.macroCell, { borderLeftColor: "#f59e0b" }]}>
            <Text style={s.macroLabel}>Fats</Text>
            <Text style={s.macroValue}>{plan.macros?.fats ?? 0}g</Text>
          </View>
        </View>

        <SectionDivider label="Daily Meals" />

        {/* MEALS */}
        {plan.meals?.map((meal, idx) => (
          <View key={idx} style={s.mealBlock} wrap={false}>
            {/* Meal Header */}
            <View style={s.mealHeader}>
              <View style={s.mealLeft}>
                <View style={s.mealNumBadge}>
                  <Text style={s.mealNumText}>{idx + 1}</Text>
                </View>
                <Text style={s.mealName}>{meal.mealName}</Text>
              </View>
              <Text style={s.mealCount}>
                {meal.mealItems?.length ?? 0} items
              </Text>
            </View>

            {meal.mealDescription ? (
              <View style={s.mealDescBox}>
                <Text style={s.mealDescText}>{meal.mealDescription}</Text>
              </View>
            ) : null}

            {meal.mealItems?.length > 0 && (
              <>
                {/* Table Head */}
                <View style={s.tableHead}>
                  <Text style={[s.th, s.colName]}>Item</Text>
                  <Text style={[s.th, s.colCal]}>Calories</Text>
                  <Text style={[s.th, s.colMac]}>Protein</Text>
                  <Text style={[s.th, s.colMac]}>Carbs</Text>
                  <Text style={[s.th, s.colMac]}>Fats</Text>
                </View>

                {/* Rows */}
                {meal.mealItems.map((item, iIdx) => (
                  <View
                    key={iIdx}
                    style={[s.row, iIdx % 2 === 0 ? s.rowEven : s.rowOdd]}
                  >
                    <Text style={s.rowName}>{item.name}</Text>
                    <View style={s.statWrap}>
                      <View style={s.statBadge}>
                        <Text style={s.statText}>{item.calories}</Text>
                      </View>
                    </View>
                    <View style={s.statWrap}>
                      <Text style={[s.statText, { color: "#34d399", fontSize: 8 }]}>{item.protein}g</Text>
                    </View>
                    <View style={s.statWrap}>
                      <Text style={[s.statText, { color: "#f97316", fontSize: 8 }]}>{item.carbs}g</Text>
                    </View>
                    <View style={s.statWrap}>
                      <Text style={[s.statText, { color: "#f59e0b", fontSize: 8 }]}>{item.fats}g</Text>
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
              {`"Fuel your body, feed your potential."`}
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
