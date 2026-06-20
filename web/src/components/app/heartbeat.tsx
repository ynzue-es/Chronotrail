"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const INTERVAL_MS = 30_000

/**
 * Pings the presence endpoint on mount and every 30s while the app is open and
 * visible, so the admin "online now" view reflects active users.
 */
export function Heartbeat() {
  const pathname = usePathname()

  useEffect(() => {
    let stopped = false
    const ping = () => {
      if (document.visibilityState !== "visible") return
      fetch("/app/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {})
    }

    ping()
    const id = setInterval(() => {
      if (!stopped) ping()
    }, INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === "visible") ping()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      stopped = true
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [pathname])

  return null
}
