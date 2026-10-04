"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Asterisk, ArrowUpRight, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { demo } from "@/lib/demo";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="site-header">
        <Link
          href="/"
          className="wordmark"
          onClick={() => setOpen(false)}
          aria-label="Third Wheel home"
        >
          <Asterisk size={35} strokeWidth={2.5} />
          <span>
            third wheel<span className="logo-dot">.</span>
          </span>
        </Link>
        <nav className={open ? "nav open" : "nav"} aria-label="Main navigation">
          <Link
            href="/demo"
            className={path.startsWith("/demo") ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            The experiment
          </Link>
          <Link href="/demo?tab=dates" onClick={() => setOpen(false)}>
            Date Night <span className="tiny-live" />
          </Link>
          <Link href="/life" onClick={() => setOpen(false)}>
            Life Together
          </Link>
          <Link href="/lab" className="nav-cta" onClick={() => setOpen(false)}>
            Build my cast <ArrowUpRight size={16} />
          </Link>
        </nav>
        <button
          className="mobile-menu icon-button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <Link href="/" className="wordmark">
          <Asterisk size={26} />
          <span>third wheel.</span>
        </Link>
        <p>Human curiosity. Agent-level audacity.</p>
        <span>
          <Heart size={13} />{" "}
          {demo.people.every((p) => p.fictional)
            ? "Fictional cast. Real experiment."
            : "Public sources. Human decisions."}
        </span>
        <Link href="/lab">Your sources, your choice.</Link>
      </footer>
    </>
  );
}
