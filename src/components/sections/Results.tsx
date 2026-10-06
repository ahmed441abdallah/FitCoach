"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useCurtain } from "@/components/layout/CurtainProvider";
import { useTranslations } from "next-intl";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

export default function Results() {
    const t = useTranslations("home.results");
    const { navigate } = useCurtain();
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-15%" });
    const cursoual = [
        "https://images.pexels.com/photos/15018025/pexels-photo-15018025.jpeg",
        "https://images.pexels.com/photos/18060231/pexels-photo-18060231.jpeg",
        "https://images.pexels.com/photos/30165246/pexels-photo-30165246.jpeg",
        "https://images.pexels.com/photos/15046667/pexels-photo-15046667.jpeg",
        "https://images.pexels.com/photos/29773898/pexels-photo-29773898.jpeg",
        "https://images.pexels.com/photos/30283461/pexels-photo-30283461.jpeg"
    ]

    return (
        <div>
            <section
                ref={ref}
                className="relative overflow-hidden bg-background py-32 px-6"
                style={{ contain: "layout paint" }}
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
                >
                    <span
                        className="font-extrabold uppercase leading-none text-foreground/[0.04] whitespace-nowrap"
                        style={{ fontSize: "clamp(20rem, 10vw, 20rem)", letterSpacing: "-0.04em" }}
                    >
                        {t("bgWord")}
                    </span>
                </div>

                {/* ── Content wrapper ── */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">

                    {/* Oval border — drawn with SVG so it's always perfectly elliptical */}


                    {/* Inner content */}
                    <div className="relative py-16 px-8">
                        {/* Kicker */}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5 }}
                            className="text-primary font-bold text-[11px] uppercase tracking-[0.35em] mb-6"
                        >
                            {t("kicker")}

                        </motion.p>

                        {/* Headline */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-foreground font-extrabold leading-[1.05] mb-6"
                            style={{
                                fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
                                letterSpacing: "-0.02em",
                                fontFamily: "var(--font-barlow-condensed), sans-serif",
                                textTransform: "none",
                            }}
                        >
                            {t("title")}


                        </motion.h2>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-foreground/50 text-sm font-normal leading-relaxed max-w-md mx-auto mb-10 normal-case tracking-normal"
                        >
                            {t("subtitle")}


                        </motion.p>


                    </div>
                </div>

            </section>
            <section className="pb-32 px-6" style={{ contain: "layout paint" }}>
                <div className="w-full max-w-6xl mx-auto">
                    <Carousel
                        opts={{ align: "start", loop: true, duration: 80, skipSnaps: true }}
                        className="w-full relative"
                    >
                        <CarouselContent className="-ml-4 sm:-ml-6 py-4">
                            {cursoual.map((item, i) => (
                                <CarouselItem key={i} className="pl-4 sm:pl-6 basis-full md:basis-1/2 lg:basis-1/3">
                                    <div className="relative group overflow-hidden rounded-[2rem] border border-border/50 bg-card h-[500px] sm:h-[650px] shadow-lg [transform:translateZ(0)]">
                                        <Image
                                            src={`${item}?auto=compress&cs=tinysrgb&w=900`}
                                            alt={t("imageAlt", { n: i + 1 })}
                                            fill
                                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                                            quality={75}
                                            loading="lazy"
                                            draggable={false}
                                            className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex items-center justify-center gap-6 mt-12">
                            <CarouselPrevious className="relative inset-auto translate-x-0 translate-y-0 h-16 w-16 rounded-full border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground transition-colors" />
                            <CarouselNext className="relative inset-auto translate-x-0 translate-y-0 h-16 w-16 rounded-full border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground transition-colors" />
                        </div>
                    </Carousel>
                </div>
            </section>
        </div>

    );
}
