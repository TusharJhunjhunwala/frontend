import Image from "next/image";
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
              <Image 
                src="https://picsum.photos/seed/logo/40/40" 
                alt="VITransit Logo"
                width={40}
                height={40}
                className="rounded-lg shadow-md"
                data-ai-hint="logo abstract"
              />
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
