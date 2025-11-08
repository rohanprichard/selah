import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

const navLinks = [
  { href: "/songs", label: "Search" },
  { href: "/my-songs", label: "My Songs" },
  { href: "/setlists", label: "My Setlists" },
];

export async function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Selah
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-4 text-sm font-medium sm:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

