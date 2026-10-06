"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";



function FaqItem({
    faq,
    isOpen,
    onClick,
}: {
    faq: { question: string; answer: string };
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <div className="border-b border-border/40">

            <button
                onClick={onClick}
                className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-foreground focus:outline-none"
            >
                <h3 className="text-lg font-semibold tracking-wide text-foreground">
                    {faq.question}
                </h3>
                <span
                    className={cn(
                        "ml-6 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-foreground transition-transform duration-300",
                        isOpen ? "rotate-45" : "rotate-0"
                    )}
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M7.49991 0.876892C7.75892 0.876892 7.96884 1.08681 7.96884 1.34582V7.03096H13.654C13.913 7.03096 14.1229 7.24088 14.1229 7.49989C14.1229 7.7589 13.913 7.96882 13.654 7.96882H7.96884V13.654C7.96884 13.913 7.75892 14.1229 7.49991 14.1229C7.2409 14.1229 7.03098 13.913 7.03098 13.654V7.96882H1.34582C1.08681 7.96882 0.876892 7.7589 0.876892 7.49989C0.876892 7.24088 1.08681 7.03096 1.34582 7.03096H7.03098V1.34582C7.03098 1.08681 7.2409 0.876892 7.49991 0.876892Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-base leading-relaxed text-muted-foreground normal-case font-normal">
                            {faq.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function Faq() {
    const t = useTranslations("home.faq");
    const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

    const faqs = [
        { question: t("q1"), answer: t("a1") },
        { question: t("q2"), answer: t("a2") },
        { question: t("q3"), answer: t("a3") },
        { question: t("q4"), answer: t("a4") },
        { question: t("q5"), answer: t("a5") },
        { question: t("q6"), answer: t("a6") },
    ];

    return (

        <section className="px-6 py-24 relative overflow-hidden bg-background">

            {/* Background subtle glow */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
                style={{ background: "radial-gradient(closest-side, var(--primary), transparent)" }}
            />

            <div className="mx-auto max-w-3xl">
                <div className="mb-16 text-center">
                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-foreground">
                        {t("tagline")}
                    </p>
                    <h2 className="mb-4 text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-foreground">
                        {t("title1")} <span className="text-accent">{t("title2")}</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground font-normal normal-case">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="flex flex-col">
                    {faqs.map((faq, index) => (
                        <FaqItem
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
