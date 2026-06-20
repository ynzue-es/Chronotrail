import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { Hero } from "@/components/marketing/hero"
import { Preview } from "@/components/marketing/preview"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Features } from "@/components/marketing/features"
import { Pricing } from "@/components/marketing/pricing"
import { PhotoCta } from "@/components/marketing/photo-cta"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Preview />
        <HowItWorks />
        <Features />
        <Pricing />
        <PhotoCta />
      </main>
      <SiteFooter />
    </div>
  )
}
