import { Bus } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { AgentRegistrationForm } from "./agent-registration-form";
import { AuthForm } from "./auth-form";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shadow-md group-hover:bg-primary/90 transition-colors">
                  <Bus className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground font-headline">
                VITransit
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Button variant="link" className="text-foreground/80 hover:text-foreground">Transit</Button>
            <Button variant="link" className="text-foreground/80 hover:text-foreground">Delivery</Button>
          </nav>
          <div className="flex items-center gap-4">
            <AgentRegistrationForm />
            <AuthForm />
          </div>
        </div>
      </div>
    </header>
  );
}
