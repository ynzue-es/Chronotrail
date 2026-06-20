import { HeartIcon } from "@phosphor-icons/react/dist/ssr"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
        <p className="flex items-center gap-1.5">
          Fait avec{" "}
          <HeartIcon size={15} weight="fill" className="text-primary" /> pour la
          commu trail
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/ynzue-es"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <span>·</span>
          <span>Photos · Unsplash</span>
        </div>
      </div>
    </footer>
  )
}
