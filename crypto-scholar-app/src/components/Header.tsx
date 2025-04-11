import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {/* Add an SVG logo later? */}
          <span className="font-bold sm:inline-block">
            Crypto Scholar
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {/* Add Nav links later if needed */}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
           {/* Maybe add theme toggle later */}
        </div>
      </div>
    </header>
  );
} 