import { MessageSquareWarning } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-info text-primary-foreground">
              <MessageSquareWarning className="h-4 w-4" />
            </span>
            ResolveDesk
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Modern complaint & ticket management for teams that care about response time.</p>
        </div>
        {[
          { title: "Product", items: ["Features", "Pricing", "Changelog", "Roadmap"] },
          { title: "Company", items: ["About", "Customers", "Careers", "Contact"] },
          { title: "Resources", items: ["Docs", "API", "Status", "Privacy"] },
        ].map((g) => (
          <div key={g.title}>
            <h4 className="text-sm font-semibold">{g.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {g.items.map((i) => <li key={i}><a href="#" className="hover:text-foreground">{i}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">© 2026 ResolveDesk. All rights reserved.</div>
    </footer>
  );
}
