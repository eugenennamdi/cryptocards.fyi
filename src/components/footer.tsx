import { GithubIcon, XIcon } from '@/components/icons';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center">
            <img src="/logo-light.png" alt="CryptoCards.fyi" className="h-6 w-auto object-contain dark:hidden" />
            <img src="/logo-dark.png" alt="CryptoCards.fyi" className="h-6 w-auto object-contain hidden dark:block" />
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Compare fees, cashback rewards, and supported networks across the best verified crypto cards.
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="flex items-center gap-3">
            <a 
              href="https://x.com/cryptocardsfyi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 hover:bg-[#1DA1F2]/10 text-muted-foreground hover:text-[#1DA1F2] transition-colors"
              aria-label="Follow us on X (Twitter)"
            >
              <XIcon className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com/eugenennamdi/cryptocards.fyi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="View source on GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} CryptoCards.fyi
          </p>
        </div>
      </div>
    </footer>
  );
}
