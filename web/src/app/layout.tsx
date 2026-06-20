import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chronotrail · Ton chrono de trail, avant la course",
    template: "%s · Chronotrail",
  },
  description:
    "Prédis ton temps de trail à partir d'un fichier GPX : chrono estimé ajusté à la pente, splits par km, segments marquants et plan de nutrition. Simple, gratuit, open-source.",
  applicationName: "Chronotrail",
  keywords: [
    "trail",
    "prédiction temps trail",
    "estimation chrono trail",
    "GPX",
    "splits",
    "dénivelé",
    "nutrition course",
    "hydratation trail",
    "ultra-trail",
    "pacing",
  ],
  authors: [{ name: "Chronotrail" }],
  creator: "Chronotrail",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Chronotrail",
    title: "Chronotrail · Ton chrono de trail, avant la course",
    description:
      "Importe un GPX et obtiens ton temps estimé ajusté à la pente, tes splits par km et ton plan de nutrition.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chronotrail · Ton chrono de trail, avant la course",
    description:
      "Importe un GPX et obtiens ton temps estimé ajusté à la pente, tes splits par km et ton plan de nutrition.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}