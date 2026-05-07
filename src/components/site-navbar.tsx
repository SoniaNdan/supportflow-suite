import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, MessageSquareWarning, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

const links = [
  { to: "/", label: "Home" },
  { to: "/#features", label: "Features" },
  { to: "/#about", label: "About" },
  { to: "/#contact", label: "Contact" },
];

export function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-info text-primary-foreground shadow-glow">
            <MessageSquareWarning className="h-5 w-5" />
          </span>
          ResolveDesk
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
          <Button asChild className="shadow-glow"><Link to="/register">Get started</Link></Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-3">
            {links.map((l) => (
              <a key={l.to} href={l.to} className="block rounded-md px-3 py-2 text-sm hover:bg-muted">{l.label}</a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" asChild><Link to="/login">Sign in</Link></Button>
              <Button className="flex-1" asChild><Link to="/register">Get started</Link></Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
