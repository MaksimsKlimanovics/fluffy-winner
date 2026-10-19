"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LANGS, UI } from "@/lib/i18n";
import { useApp } from "./AppProvider";
import { Icon } from "./Icon";
import { Mascot } from "./Mascot";

/**
 * Navigation bar in the iOS pattern: a back button that names the previous
 * screen, and the page's large title (marked `data-large-title`) moving into
 * the bar as a small centered title once it scrolls away.
 */
export function TopBar({ back, backLabel, title }: { back?: string; backLabel?: string; title?: string }) {
  const { lang, setLang, t, totalStars } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const el = title ? document.querySelector("[data-large-title]") : null;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCollapsed(!entry.isIntersecting), {
      rootMargin: "-56px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [title]);

  return (
    <header className="navbar" data-collapsed={collapsed}>
      <div className="navbar-side">
        {back ? (
          <Link href={back} className="nav-back">
            <Icon name="chevronLeft" size={22} />
            <span>{backLabel ?? t(UI.back)}</span>
          </Link>
        ) : (
          <Link href="/" className="brand">
            <Mascot size={30} />
            <span>{t(UI.appName)}</span>
          </Link>
        )}
      </div>
      {title && (
        <span className="nav-title" aria-hidden={!collapsed}>
          {title}
        </span>
      )}
      <div className="navbar-side end">
        <span className="star-pill" aria-label={`${totalStars} ${t(UI.stars)}`}>
          <Icon name="star" size={15} filled />
          {totalStars}
        </span>
        <div className="segmented small" role="group" aria-label="Valoda / Язык">
          {LANGS.map((l) => (
            <button key={l.id} type="button" onClick={() => setLang(l.id)} aria-pressed={l.id === lang}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

/** Tab bar: the app's top-level destinations, symbol above label. */
export function BottomNav() {
  const { t } = useApp();
  const path = usePathname();
  const items = [
    { href: "/", icon: "house" as const, label: t(UI.home), active: path === "/" || path.startsWith("/klase") },
    { href: "/sacensibas", icon: "trophy" as const, label: t(UI.duel), active: path.startsWith("/sacensibas") },
    { href: "/chat", icon: "bubble" as const, label: t(UI.chat), active: path.startsWith("/chat") },
  ];
  return (
    <nav className="tabbar" aria-label={t(UI.appName)}>
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={i.active ? "page" : undefined}>
          <Icon name={i.icon} size={24} />
          <span>{i.label}</span>
        </Link>
      ))}
    </nav>
  );
}
