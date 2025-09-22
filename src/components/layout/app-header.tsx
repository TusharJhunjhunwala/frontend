import { CarIcon } from "@/components/icons/car-icon";
import Link from "next/link";
import { Button } from "../ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-lg bg-primary/90 shadow-md group-hover:bg-primary transition-colors">
                <div className="w-6 h-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">VT</span>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xl font-bold tracking-tighter text-foreground font-headline">
                VITransit
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="link" className="text-foreground/80 hover:text-foreground">Transit</Button>
            <Button variant="link" className="text-foreground/80 hover:text-foreground">Delivery</Button>
          </nav>
          <div className="flex items-center gap-4">
            <Button>Sign in</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
