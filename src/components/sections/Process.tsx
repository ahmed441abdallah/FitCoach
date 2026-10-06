import { useTranslations } from "next-intl";

const STEPS = ["01", "02", "03", "04"] as const;

export default function Process() {
    const t = useTranslations("home.process");

    return (
        <section className="relative px-4 md:px-16 py-12 my-16">
            {/* Header */}
            <div className="text-center mb-16 px-6">
                <p className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-3">
                    {t("kicker")}
                </p>
                <h2 className="text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-foreground">
                    {t("title1")}
                    <br />
                    <span className="text-accent">{t("title2")}</span>
                </h2>
            </div>

            {/* Steps */}
            <div className="relative max-w-7xl mx-auto">
                {/* Connector line across the top (desktop) */}
                <div
                    aria-hidden
                    className="hidden md:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                />

                <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                    {STEPS.map((num, i) => (
                        <li
                            key={num}
                            className={[
                                "group relative px-6 pt-10 pb-8 md:px-8",
                                // horizontal divider between rows on mobile / tablet
                                i > 0 ? "border-t border-white/10 sm:border-t-0" : "",
                                i >= 2 ? "sm:border-t sm:border-white/10 md:border-t-0" : "",
                                // vertical divider between columns
                                i % 2 === 1 ? "sm:border-s sm:border-white/10" : "",
                                i > 0 ? "md:border-s md:border-white/10" : "",
                            ].join(" ")}
                        >
                            {/* Dot on the connector line */}
                            <span
                                aria-hidden
                                className="hidden md:block absolute -top-[5px] start-8 w-2.5 h-2.5 rounded-full bg-background border-2 border-primary transition-colors duration-300 group-hover:bg-primary"
                            />

                            <span className="block text-8xl leading-none mb-6 font-extrabold text-white/[0.13] transition-colors duration-300 group-hover:text-primary/40">
                                {num}
                            </span>
                            <h3 className="text-2xl font-bold mb-3 text-foreground">
                                {t(`s${i + 1}Title`)}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed normal-case tracking-normal font-normal">
                                {t(`s${i + 1}Desc`)}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
