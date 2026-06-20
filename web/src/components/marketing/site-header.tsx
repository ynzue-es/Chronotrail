import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/brand/logo"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Logo size={24} className="text-primary" />
          <span className="font-semibold tracking-tight">Chronotrail</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition-colors">
            Fonctionnalités
          </a>
          <a href="#how" className="hover:text-foreground transition-colors">
            Comment ça marche
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Tarifs
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="size-9">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <GithubLogoIcon size={18} weight="regular" />
            </a>
          </Button>
          <ThemeToggle />
          <div className="mx-1 h-5 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            asChild
          >
            <a href="/auth/login">Connexion</a>
          </Button>
          <Button size="sm" asChild>
            <a href="/auth/signup">Inscription</a>
          </Button>
        </div>
      </div>
    </header>
  )
}