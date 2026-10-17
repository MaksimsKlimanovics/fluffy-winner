"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { Mascot } from "./Mascot";

export function TopBar({ back }: { back?: string }) {
  const { lang, setLang, t, totalStars } = useApp();
  return (
    <header className="topbar">
      {back ? (
        <Link href={back} className="icon-btn" aria-label={t(UI.back)}>
          ←
        </Link>
      ) : (
        <Link href="/" className="brand">
          <Mascot size={34} />
          <span>{t(UI.appName)}</span>
        </Link>
      )}
      <div className="topbar-right">
        <span className="star-pill" title={t(UI.stars)}>
          ⭐ {totalStars}
        </span>
        <div className="lang-switch" role="group" aria-label="Language">
          {LANGS.map((l) => (
            <button
              key={l.id}
              className={l.id === lang ? "active" : ""}
              onClick={() => setLang(l.id)}
              aria-pressed={l.id === lang}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { t } = useApp();
  const path = usePathname();
  const items = [
    { href: "/", icon: "🏠", label: t(UI.home), active: path === "/" || path.startsWith("/klase") },
    { href: "/chat", icon: "💬", label: t(UI.chat), active: path.startsWith("/chat") },
  ];
  return (
    <nav className="bottomnav">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={i.active ? "active" : ""}>
          <span aria-hidden="true">{i.icon}</span>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
