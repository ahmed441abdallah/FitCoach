"use client";

import { cn } from "cn";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface TestimonialBasicGridItem {
    id?: string;
    name: string;
    avatar: string;
    content: string;
    role?: string;
    username?: string;
    date?: string;
    link?: string;
    icon?: string;
}

interface TestimonialBasicGridProps {
    heading: string;
    description: string;
    testimonials: TestimonialBasicGridItem[];
    className?: string;
}

interface Testimonial9Props extends TestimonialBasicGridProps { }
type Props = Partial<Testimonial9Props>;

// English fallback content (kept for reference; translations are used at runtime)
export const defaultProps: Testimonial9Props = {
    heading: "Client Success Stories",
    description:
        "Hear from real people who have transformed their lives through our online coaching programs.",
    testimonials: [
        {
            id: "1",
            name: "Michael T.",
            username: "michaelt_fit",
            date: "2024-01-15",
            role: "Lost 30 lbs",
            avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
            content:
                "The personalized workout plans and continuous support through the app were exactly what I needed. I've tried everything before, but having an online coach keeping me accountable made all the difference. I'm in the best shape of my life.",
            link: "#",
            icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/instagram-icon.svg",
        },
        {
            id: "2",
            name: "Jessica R.",
            username: "jess_runs",
            date: "2024-02-10",
            role: "Marathon Finisher",
            avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150",
            content:
                "I never thought I could run a marathon, but the structured weekly check-ins and tailored running programs proved me wrong. My coach adjusted my plan every time I felt pain, keeping me injury-free all the way to the finish line.",
            link: "#",
            icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/x-icon.svg",
        },
        {
            id: "3",
            name: "David K.",
            username: "dk_lifts",
            date: "2024-02-28",
            role: "Gained 15 lbs muscle",
            avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150",
            content:
                "I've been going to the gym for years but was stuck on a plateau. The custom nutrition protocol and precise training blocks completely changed my physique. It's like having a personal trainer in your pocket 24/7.",
            link: "#",
            icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/instagram-icon.svg",
        },
        {
            id: "4",
            name: "Sarah W.",
            username: "sarah_wellness",
            date: "2023-11-05",
            role: "Postpartum Recovery",
            avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
            content:
                "Getting back into shape after having my second child felt impossible. The flexible coaching approach allowed me to work out from home while the baby slept. The empathy and understanding from my coach kept me going on the hard days.",
            link: "#",
            icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/facebook-icon.svg",
        },
        {
            id: "5",
            name: "Marcus B.",
            username: "marcus_strength",
            date: "2024-03-01",
            role: "Strength Competitor",
            avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150",
            content:
                "The video form checks are incredible. I record my heavy lifts, and within hours my coach sends back a detailed breakdown of my technique. My squat went up 50lbs in 3 months just from fixing my bracing mechanics.",
            link: "#",
            icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/instagram-icon.svg",
        },
        {
            id: "6",
            name: "Elena G.",
            username: "elena_getsfit",
            date: "2023-12-18",
            role: "Lifestyle Transformation",
            avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150",
            content:
                "I travel for work constantly, which used to ruin my diet and training. My coach designs hotel-friendly workouts and helps me navigate restaurant menus. For the first time, fitness fits into my life instead of taking it over.",
            link: "#",
            icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/linkedin-icon.svg",
        }
    ],
};

// Static media per testimonial — text comes from translations (home.testimonials.t{n}*)
const MEDIA = [
    { avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150", icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/instagram-icon.svg" },
    { avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150", icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/x-icon.svg" },
    { avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150", icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/instagram-icon.svg" },
    { avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150", icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/facebook-icon.svg" },
    { avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150", icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/instagram-icon.svg" },
    { avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150", icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/placeholder/testimonials/social-network-icons/linkedin-icon.svg" },
];

const Testimonial = (props: Props) => {
    const t = useTranslations("home.testimonials");

    const translated: Testimonial9Props = {
        heading: t("heading"),
        description: t("description"),
        testimonials: MEDIA.map((m, i) => ({
            id: String(i + 1),
            name: t(`t${i + 1}Name`),
            role: t(`t${i + 1}Role`),
            content: t(`t${i + 1}Content`),
            avatar: m.avatar,
            icon: m.icon,
            link: "#",
        })),
    };

    const { heading, description, testimonials, className } = {
        ...translated,
        ...props,
    };

    const list = testimonials.slice(0, 6);

    return (
        <section className={cn("py-32", className)}>
            <div className="container mx-auto">
                <div className="flex flex-col items-center gap-6">
                    <h2 className="text-center text-3xl font-semibold lg:text-5xl">
                        {heading}
                    </h2>
                    <p className="text-muted-foreground lg:text-lg">{description}</p>
                </div>
                <div className="mt-14 w-full">
                    <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
                        {list.map((testimonial, idx) => {
                            return (
                                <Card key={idx} className="mb-5 break-inside-avoid p-5">
                                    <div className="flex justify-between">
                                        <div className="flex gap-4 leading-5">
                                            <Avatar className="size-9 rounded-full ring-1 ring-input">
                                                <AvatarImage
                                                    src={testimonial.avatar}
                                                    alt={testimonial.name}
                                                />
                                            </Avatar>
                                            <div className="text-sm">
                                                <p className="font-medium">{testimonial.name}</p>
                                                <p className="text-muted-foreground">
                                                    {testimonial.role}
                                                </p>
                                            </div>
                                        </div>
                                        {testimonial.icon ? (
                                            <a href={testimonial.link ?? "#"}>
                                                <img
                                                    alt="Testimonial source"
                                                    src={testimonial.icon}
                                                    className="size-4 dark:invert"
                                                />
                                            </a>
                                        ) : null}
                                    </div>
                                    <div className="mt-2 leading-7 text-muted-foreground">
                                        <q>{testimonial.content}</q>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
