import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link
              href="/"
              className="text-foreground/80 transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/create"
              className="text-foreground/80 transition-colors hover:text-primary"
            >
              Create Card
            </Link>
          </nav>
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/create">
              <Wand2 className="mr-2 h-4 w-4" />
              Open Studio
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
