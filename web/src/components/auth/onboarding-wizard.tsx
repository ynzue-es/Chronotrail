"use client"

import { useActionState, useState } from "react"
import {
  MountainsIcon,
  PathIcon,
  TimerIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UploadSimpleIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { completeOnboarding, type OnboardingState } from "@/app/onboarding/actions"

const initialState: OnboardingState = {}
const STEP_COUNT = 4

export function OnboardingWizard({
  defaultFirst = "",
  defaultLast = "",
}: {
  defaultFirst?: string
  defaultLast?: string
}) {
  const reduce = useReducedMotion()
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState
  )

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [firstname, setFirstname] = useState(defaultFirst)
  const [lastname, setLastname] = useState(defaultLast)
  const [pace, setPace] = useState("6:00")
  const [localError, setLocalError] = useState<string | null>(null)

  const go = (to: number) => {
    setDir(to > step ? 1 : -1)
    setStep(to)
  }

  const next = () => {
    // Validate the profile step before leaving it.
    if (step === 2 && !firstname.trim()) {
      setLocalError("Ton prénom est requis.")
      return
    }
    setLocalError(null)
    go(Math.min(step + 1, STEP_COUNT - 1))
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -40 }),
  }

  return (
    <form action={formAction} className="flex flex-col gap-7">
      {/* Values submitted on the final step (persist across step changes) */}
      <input type="hidden" name="firstname" value={firstname} />
      <input type="hidden" name="lastname" value={lastname} />
      <input type="hidden" name="reference_pace" value={pace} />

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      <div className="relative min-h-[260px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5"
          >
            {step === 0 && (
              <Intro
                icon={<MountainsIcon size={26} weight="duotone" />}
                title="Bienvenue sur Chronotrail 👋"
                text="Chronotrail prédit ton temps de trail à partir d'un simple fichier GPX : chrono estimé, splits km par km et plan nutrition. Gratuit et sans boîte noire."
              />
            )}

            {step === 1 && (
              <Intro
                icon={<PathIcon size={26} weight="duotone" />}
                title="Le principe : le km-effort"
                text="Chaque 100 m de dénivelé positif équivaut à ~1 km de plat. On ajuste ton allure à chaque montée et descente pour un chrono réaliste, pas une simple moyenne."
              />
            )}

            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Badge icon={<TimerIcon size={26} weight="duotone" />} />
                  <h2 className="text-xl font-semibold tracking-tight">
                    Ton profil
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    On personnalise tes prédictions avec ça.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="of_first">Prénom</Label>
                    <Input
                      id="of_first"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      autoComplete="given-name"
                      placeholder="Kilian"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="of_last">Nom</Label>
                    <Input
                      id="of_last"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      autoComplete="family-name"
                      placeholder="Jornet"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="of_pace">Allure de référence sur le plat</Label>
                  <div className="relative">
                    <Input
                      id="of_pace"
                      value={pace}
                      onChange={(e) => setPace(e.target.value)}
                      inputMode="numeric"
                      placeholder="6:00"
                      className="pr-12"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                      /km
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ton allure tranquille sur du plat (format m:ss). Sert de base
                    à tes prédictions — tu pourras l&apos;ajuster à tout moment.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-4 text-center">
                <Badge icon={<CheckCircleIcon size={26} weight="duotone" />} />
                <h2 className="text-xl font-semibold tracking-tight">
                  Tout est prêt{firstname ? `, ${firstname}` : ""} 🎉
                </h2>
                <p className="text-sm text-muted-foreground">
                  Importe un premier GPX pour voir ta prédiction tout de suite,
                  ou file directement sur ton tableau de bord.
                </p>

                {(state.error || localError) && (
                  <p className="text-xs text-destructive" role="alert">
                    {state.error || localError}
                  </p>
                )}

                <div className="mt-2 flex w-full flex-col gap-2">
                  <Button
                    type="submit"
                    name="next"
                    value="/app/courses/new"
                    size="lg"
                    disabled={pending}
                    className="w-full"
                  >
                    <UploadSimpleIcon size={16} weight="bold" />
                    {pending ? "Un instant…" : "Importer un GPX maintenant"}
                  </Button>
                  <Button
                    type="submit"
                    name="next"
                    value="/app"
                    size="lg"
                    variant="ghost"
                    disabled={pending}
                    className="w-full"
                  >
                    Plus tard, aller au tableau de bord
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation (hidden on the final step, which has its own CTAs) */}
      {step < STEP_COUNT - 1 && (
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => go(step - 1)}>
              <ArrowLeftIcon size={16} /> Retour
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" size="sm" onClick={next}>
            Suivant
            <ArrowRightIcon size={16} weight="bold" />
          </Button>
        </div>
      )}

      {localError && step === 2 && (
        <p className="-mt-3 text-center text-xs text-destructive" role="alert">
          {localError}
        </p>
      )}
    </form>
  )
}

function Intro({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Badge icon={icon} />
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}

function Badge({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      {icon}
    </div>
  )
}
