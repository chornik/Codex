"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FolderSearch,
  Building2,
  BookOpen,
  ShieldCheck,
  Menu,
  X,
  Wrench,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
export function Shell({
  children,
  demo,
  ephemeral = false,
}: {
  children: React.ReactNode;
  demo: boolean;
  ephemeral?: boolean;
}) {
  const path = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const nav = [
    {
      href: "/",
      label: "Übersicht",
      icon: LayoutDashboard,
      active: path === "/" && !params.get("view"),
    },
    {
      href: "/?view=cases",
      label: "Alle Suchfälle",
      icon: FolderSearch,
      active: path.startsWith("/cases") || params.get("view") === "cases",
    },
    {
      href: "/?view=review",
      label: "Technische Prüfung",
      icon: ShieldCheck,
      active: params.get("view") === "review",
    },
    {
      href: "/hotels",
      label: "Unsere Hotels",
      icon: Building2,
      active: path === "/hotels",
    },
  ];
  return (
    <div className="app-shell">
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Menü schließen"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon">
            <Wrench size={22} />
          </span>
          <span>
            parts<span className="brand-light">desk</span>
            <small>TECHNICAL SERVICES</small>
          </span>
        </Link>
        <div className="workspace-switch">
          <div className="workspace-avatar">H</div>
          <span>
            Hotelgruppe<small>Technik & Instandhaltung</small>
          </span>
        </div>
        <div className="nav-label">ARBEITSBEREICH</div>
        <nav aria-label="Hauptnavigation">
          {nav.map((item) => (
            <Link
              onClick={() => setOpen(false)}
              key={item.href}
              href={item.href}
              className={`nav-item ${item.active ? "active" : ""}`}
              aria-current={item.active ? "page" : undefined}
            >
              <item.icon size={19} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon">
              <BookOpen size={19} />
            </span>
            <strong>Wissen, das weiterhilft.</strong>
            <p>Von der ersten Spur zum dokumentierten Ersatzteil.</p>
            <Link href="/guide" onClick={() => setOpen(false)}>
              Zum Handbuch <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="team-user">
            <div className="user-avatar">TS</div>
            <div>
              Technical Services<small>Lokaler Arbeitsbereich</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              className="mobile-menu icon-button"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-title">Ersatzteil-Recherche</span>
            <span className="topbar-divider" />
            <span className="muted topbar-sub">
              Gemeinsam Anlagen länger nutzen.
            </span>
          </div>
          <div className="topbar-right">
            <span className={`mode-indicator ${demo ? "" : "live"}`}>
              <span />
              {demo ? "Demo-Modus" : "Websuche aktiv"}
            </span>
            <span className="user-avatar small">TS</span>
          </div>
        </header>
        {ephemeral && (
          <div className="hosted-demo-notice" role="status">
            Geschützte Online-Testdemo · Nur Beispieldaten verwenden. Eingaben
            und Uploads können bei einem Serverneustart verloren gehen.
          </div>
        )}
        <main className="main-content">{children}</main>
        <footer className="app-footer">
          <span>partsdesk · Recherche mit Verantwortung</span>
          <span>
            Lokaler MVP ·{" "}
            {demo ? "Fiktive Angebote und Preise" : "Webtreffer sind ungeprüft"}
          </span>
        </footer>
      </div>
    </div>
  );
}
