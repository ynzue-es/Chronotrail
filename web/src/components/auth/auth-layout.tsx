import Link from "next/link"
import { MountainsIcon } from "@phosphor-icons/react/dist/ssr"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <RidgelineBackground />

      <header className="relative z-10 border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <MountainsIcon
              size={24}
              weight="duotone"
              className="text-primary"
            />
            <span className="font-semibold tracking-tight">Chronotrail</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}

function RidgelineBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-[0.06] dark:opacity-[0.1]"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 300"
        className="w-full max-w-6xl text-primary"
        preserveAspectRatio="none"
      >
        <path
          d="M0,250 L80,180 L160,210 L240,120 L340,160 L420,80 L520,140 L620,60 L720,130 L820,90 L920,170 L1020,110 L1120,190 L1200,150 L1200,300 L0,300 Z"
          fill="currentColor"
        />
        <path
          d="M0,270 L100,230 L200,250 L300,200 L400,240 L500,190 L600,230 L700,180 L800,220 L900,200 L1000,240 L1100,210 L1200,230 L1200,300 L0,300 Z"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}
