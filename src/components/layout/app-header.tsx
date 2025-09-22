import { CarIcon } from "@/components/icons/car-icon";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center p-4 md:justify-start md:p-6">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="p-2 rounded-full bg-primary/90 shadow-lg group-hover:bg-primary transition-colors">
            <CarIcon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold tracking-tighter text-foreground font-headline">
          Streamline
        </span>
      </Link>
    </header>
  );
}
