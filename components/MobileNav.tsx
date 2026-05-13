"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type MobileNavLink = { href: string; label: string; external?: boolean };

export function MobileNav({ links }: { links: MobileNavLink[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open ? (
        <ul className="mobile-nav-sheet" role="menu">
          {links.map((l) =>
            l.external ? (
              <li key={l.href} role="none">
                <a href={l.href} onClick={() => setOpen(false)} role="menuitem">
                  {l.label}
                </a>
              </li>
            ) : (
              <li key={l.href} role="none">
                <Link href={l.href} onClick={() => setOpen(false)} role="menuitem">
                  {l.label}
                </Link>
              </li>
            )
          )}
        </ul>
      ) : null}
    </>
  );
}
