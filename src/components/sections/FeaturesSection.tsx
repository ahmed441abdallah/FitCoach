import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    IconBarbell,
    IconBrain,
    IconCalendarStats,
    IconChartBar,
    IconDeviceMobile,
    IconHeartRateMonitor,
    IconMessageChatbot,
    IconSalad,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export function FeaturesSection() {
    const t = useTranslations("home.features");

    const features = [
        {
            title: t("f1Title"),
            description: t("f1Desc"),
            icon: <IconBarbell />,
        },
        {
            title: t("f2Title"),
            description: t("f2Desc"),
            icon: <IconSalad />,
        },
        {
            title: t("f3Title"),
            description: t("f3Desc"),
            icon: <IconChartBar />,
        },
        {
            title: t("f4Title"),
            description: t("f4Desc"),
            icon: <IconHeartRateMonitor />,
        },
        {
            title: t("f5Title"),
            description: t("f5Desc"),
            icon: <IconCalendarStats />,
        },
        {
            title: t("f6Title"),
            description: t("f6Desc"),
            icon: <IconMessageChatbot />,
        },
        {
            title: t("f7Title"),
            description: t("f7Desc"),
            icon: <IconBrain />,
        },
        {
            title: t("f8Title"),
            description: t("f8Desc"),
            icon: <IconDeviceMobile />,
        },
    ];

    return (
        <section className="relative py-24 px-6 overflow-hidden" style={{ contain: 'layout style' }}>
            {/* Background image */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.pexels.com/photos/12040569/pexels-photo-12040569.jpeg?auto=compress&cs=tinysrgb&w=1600"
                    alt="Fitness background"
                    fill
                    loading="lazy"
                    quality={75}
                    className="object-cover object-center"
                    sizes="100vw"
                />
                {/* Dark transparent overlay */}
                <div
                    className="absolute inset-0"
                    style={{ background: "rgba(10, 10, 18, 0.90)" }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Section header */}
                <div className="max-w-7xl mx-auto mb-16">
                    <p className="text-foreground font-bold uppercase tracking-[0.3em] text-sm mb-3">
                        {t("tagline")}
                    </p>
                    <h2 className="text-5xl md:text-6xl font-extrabold uppercase tracking-tight mb-4 text-foreground">
                        {t("title")}
                        <br />
                        <span className="text-accent">{t("titleHighlight")}</span>
                    </h2>
                    <p className="text-muted-foreground text-base normal-case font-normal tracking-normal max-w-2xl leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>

            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                    <Feature key={feature.title} {...feature} index={index} />
                ))}
            </div>
        </section >
    );
}

const Feature = ({
    title,
    description,
    icon,
    index,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
                (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
                index < 4 && "lg:border-b dark:border-neutral-800"
            )}
        >
            {/* Hover gradient — top half */}
            {index < 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition-opacity duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-900 dark:from-neutral-800 to-transparent pointer-events-none" />
            )}
            {/* Hover gradient — bottom half */}
            {index >= 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition-opacity duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-900 dark:from-neutral-800 to-transparent pointer-events-none" />
            )}

            {/* Icon */}
            <div className="mb-4 relative z-10 px-10 text-foreground">
                {icon}
            </div>

            {/* Title */}
            <div className="text-lg font-bold mb-2 relative z-10 px-10 uppercase tracking-wide">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition-transform duration-200 inline-block text-neutral-100 transform-gpu">
                    {title}
                </span>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-400 max-w-xs relative z-10 px-10 normal-case font-normal tracking-normal leading-relaxed">
                {description}
            </p>
        </div>
    );
};
