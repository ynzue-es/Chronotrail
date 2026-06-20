"use client"

import { useEffect, useRef } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
} from "motion/react"

/**
 * Layered, parallaxing mountain range that sits behind the hero.
 * - Ridges drift at different rates on scroll and follow the pointer (depth).
 * - Mist bands and clouds drift sideways on a loop.
 * - A dashed trail draws itself across the foreground ridge.
 * Fully vector + theme-aware (uses the forest `primary` token). Swap in real
 * photos later by layering <img> elements behind the ridges if desired.
 * Honors prefers-reduced-motion (parallax + loops disabled).
 */
export function MountainScene() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Pointer parallax (normalized -0.5..0.5), smoothed with springs.
  const pxRaw = useMotionValue(0)
  const pyRaw = useMotionValue(0)
  const px = useSpring(pxRaw, { stiffness: 60, damping: 20, mass: 0.6 })
  const py = useSpring(pyRaw, { stiffness: 60, damping: 20, mass: 0.6 })

  useEffect(() => {
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      pxRaw.set(e.clientX / window.innerWidth - 0.5)
      pyRaw.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener("pointermove", onMove)
    return () => window.removeEventListener("pointermove", onMove)
  }, [pxRaw, pyRaw, reduce])

  // Per-layer transforms: depth = scroll lift + pointer shift.
  // Named useLayer so the rules-of-hooks lint is satisfied (called a fixed
  // number of times, unconditionally, in stable order).
  const useLayer = (scrollLift: number, pointer: number) => ({
    y: useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : scrollLift]),
    x: useTransform(px, [-0.5, 0.5], [reduce ? 0 : -pointer, reduce ? 0 : pointer]),
  })

  const far = useLayer(-30, 8)
  const mid = useLayer(-70, 16)
  const near = useLayer(-120, 28)
  const fore = useLayer(-180, 40)
  const sunY = useTransform(py, [-0.5, 0.5], [reduce ? 0 : -10, reduce ? 0 : 10])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <svg
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="45%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ridge-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Sun / atmospheric glow */}
        <motion.g style={{ y: sunY }} className="text-primary">
          <Sun reduce={!!reduce} />
        </motion.g>

        {/* Drifting clouds / high mist */}
        <Clouds reduce={!!reduce} />

        {/* Far ridge */}
        <motion.g style={far} className="text-primary/20">
          <path
            d="M0,300 L120,250 L240,285 L360,210 L480,255 L600,180 L720,240 L840,165 L960,225 L1080,170 L1200,235 L1320,195 L1440,250 L1440,620 L0,620 Z"
            fill="currentColor"
          />
        </motion.g>

        {/* Mist band between far and mid */}
        <Mist y={320} opacity={0.5} reduce={!!reduce} duration={42} />

        {/* Mid ridge */}
        <motion.g style={mid} className="text-primary/35">
          <path
            d="M0,360 L160,300 L300,345 L440,270 L560,320 L700,250 L820,310 L960,255 L1100,315 L1240,265 L1380,320 L1440,300 L1440,620 L0,620 Z"
            fill="currentColor"
          />
        </motion.g>

        {/* Mist band between mid and near */}
        <Mist y={400} opacity={0.45} reduce={!!reduce} duration={34} reverse />

        {/* Near ridge + the trail */}
        <motion.g style={near} className="text-primary/60">
          <path
            d="M0,440 L150,380 L280,430 L420,350 L560,420 L700,340 L760,360 L900,330 L1040,400 L1180,345 L1320,410 L1440,365 L1440,620 L0,620 Z"
            fill="url(#ridge-fade)"
          />
          <Trail reduce={!!reduce} />
        </motion.g>

        {/* Foreground hill */}
        <motion.g style={fore} className="text-primary">
          <path
            d="M0,520 L180,470 L360,510 L540,455 L720,505 L900,460 L1080,505 L1260,465 L1440,505 L1440,620 L0,620 Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
        </motion.g>
      </svg>

      {/* Soft fade so ridges melt into the page background at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

function Sun({ reduce }: { reduce: boolean }) {
  return (
    <motion.g
      animate={reduce ? undefined : { opacity: [0.85, 1, 0.85], scale: [1, 1.04, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "1120px 170px" }}
    >
      <circle cx="1120" cy="170" r="190" fill="url(#sun-glow)" />
      <circle cx="1120" cy="170" r="46" fill="currentColor" fillOpacity="0.45" />
    </motion.g>
  )
}

function Clouds({ reduce }: { reduce: boolean }) {
  return (
    <g className="text-primary/10">
      <motion.g
        animate={reduce ? undefined : { x: [0, 60, 0] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="300" cy="150" rx="120" ry="22" fill="currentColor" />
        <ellipse cx="420" cy="170" rx="90" ry="16" fill="currentColor" />
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { x: [0, -50, 0] }}
        transition={{ duration: 46, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="900" cy="110" rx="140" ry="20" fill="currentColor" />
        <ellipse cx="1040" cy="135" rx="80" ry="14" fill="currentColor" />
      </motion.g>
    </g>
  )
}

function Mist({
  y,
  opacity,
  reduce,
  duration,
  reverse = false,
}: {
  y: number
  opacity: number
  reduce: boolean
  duration: number
  reverse?: boolean
}) {
  return (
    <motion.g
      className="text-background"
      style={{ opacity }}
      animate={reduce ? undefined : { x: reverse ? [0, -80, 0] : [0, 80, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="500" cy={y} rx="520" ry="34" fill="currentColor" />
      <ellipse cx="1080" cy={y + 10} rx="460" ry="28" fill="currentColor" />
    </motion.g>
  )
}

function Trail({ reduce }: { reduce: boolean }) {
  const d =
    "M40,470 C220,430 300,470 460,400 S700,370 760,375 C900,382 1000,360 1160,372 S1380,400 1440,388"
  return (
    <motion.path
      d={d}
      fill="none"
      className="text-background"
      stroke="currentColor"
      strokeOpacity={0.7}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeDasharray="2 10"
      initial={reduce ? { pathLength: 1, opacity: 0.7 } : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 0.7 }}
      viewport={{ once: true }}
      transition={{ duration: 2.6, ease: "easeInOut", delay: 0.4 }}
    />
  )
}
