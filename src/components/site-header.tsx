import { Link } from "@tanstack/react-router";
import { Sticker } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Sticker className="size-6 text-primary" aria-hidden="true" />
          <span className="font-display text-lg font-bold tracking-tight">StickerForge</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            to="/styles"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Styles
          </Link>
          <Link
            to="/order"
            className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Start a pack
          </Link>
        </nav>
      </div>
    </header>
  );
}
