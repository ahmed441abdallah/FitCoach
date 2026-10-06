import { TransitionLink } from "@/components/layout/TransitionLink";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("nav");
  
  const footerLinks = [
    { href: "#", label: t("privacy") },
    { href: "#", label: t("terms") },
    { href: "#", label: t("contact") },
  ];

  return (
    <footer className="border-t border-foreground/[0.06] py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <TransitionLink
          href="/"
          className="text-xl font-extrabold uppercase tracking-widest text-gradient"
        >
          FitCoach
        </TransitionLink>

        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} {t("copyright")}
        </p>

        <div className="flex gap-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
