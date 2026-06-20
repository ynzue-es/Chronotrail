"use client"

import { useEffect, useState } from "react"
import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Over the photo hero (top) the header is transparent with light text;
  // once scrolled it turns into the usual solid, blurred bar.
  const onHero = !scrolled

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Logo size={24} className={onHero ? "text-white" : "text-primary"} />
          <span
            className={cn(
              "font-semibold tracking-tight transition-colors",
              onHero ? "text-white" : "text-foreground"
            )}
          >
            Chronotrail
          </span>
        </div>

        <nav
          className={cn(
            "hidden items-center gap-6 text-sm transition-colors md:flex",
            onHero ? "text-white/80" : "text-muted-foreground"
          )}
        >
          <a href="#features" className={onHero ? "hover:text-white" : "hover:text-foreground"}>
            Fonctionnalités
          </a>
          <a href="#how" className={onHero ? "hover:text-white" : "hover:text-foreground"}>
            Comment ça marche
          </a>
          <a href="#pricing" className={onHero ? "hover:text-white" : "hover:text-foreground"}>
            Tarifs
          </a>
        </nav>

        <div className={cn("flex items-center gap-2", onHero && "text-white")}>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn("size-9", onHero && "text-white hover:bg-white/15 hover:text-white")}
          >
            <a
              href="https://github.com/ynzue-es"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <GithubLogoIcon size={18} weight="regular" />
            </a>
          </Button>
          <ThemeToggle />
          <div className={cn("mx-1 h-5 w-px", onHero ? "bg-white/30" : "bg-border")} />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "hidden sm:inline-flex",
              onHero && "text-white hover:bg-white/15 hover:text-white"
            )}
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
