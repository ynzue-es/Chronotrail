import { XMLParser } from "fast-xml-parser"

export type NewsItem = {
  title: string
  link: string
  source: string
  date: string | null // ISO
  image: string | null
}

// Flux vérifiés actifs (sonde curl). `fr` = source francophone (prioritaire).
const FEEDS: { name: string; url: string; fr: boolean }[] = [
  { name: "Distances+", url: "https://distances.plus/feed/", fr: true },
  { name: "Trail & Running", url: "https://www.trailandrunning.com/feed/", fr: true },
  { name: "u-trail", url: "https://www.u-trail.com/feed/", fr: true },
  { name: "Trail Session", url: "https://www.trail-session.fr/feed/", fr: true },
  { name: "Lepape-Info", url: "https://www.lepape-info.com/feed/", fr: true },
  { name: "iRunFar", url: "https://www.irunfar.com/feed", fr: false },
  { name: "Trail Runner", url: "https://trailrunnermag.com/feed", fr: false },
  { name: "Freetrail", url: "https://freetrail.com/feed", fr: false },
]

const FR_SOURCES = new Set(FEEDS.filter((f) => f.fr).map((f) => f.name))

function text(v: unknown): string {
  if (v == null) return ""
  if (typeof v === "string") return v
  if (typeof v === "object" && "#text" in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>)["#text"] ?? "")
  }
  return String(v)
}

function toArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&(?:#0?39|apos);/g, "'")
    .replace(/&nbsp;/g, " ")
}

function firstImgInHtml(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return m ? m[1] : null
}

/** Cherche une image dans l'item RSS (media:*, enclosure, html du contenu). */
function feedImage(it: Record<string, unknown>): string | null {
  const media = it["media:content"] ?? it["media:thumbnail"]
  for (const m of toArray<Record<string, unknown>>(media as never)) {
    if (m && typeof m === "object" && m.url) return String(m.url)
  }
  const enc = it.enclosure as Record<string, unknown> | undefined
  if (enc?.url && String(enc.type ?? "").startsWith("image")) {
    return String(enc.url)
  }
  const html = text(it["content:encoded"]) || text(it.description)
  return html ? firstImgInHtml(html) : null
}

async function fetchText(
  url: string,
  ms: number,
): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Chronotrail/1.0 (+news widget)" },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Récupère l'og:image d'une page article (fallback quand le flux n'a pas d'image). */
async function ogImage(url: string): Promise<string | null> {
  const html = await fetchText(url, 6000)
  if (!html) return null
  const head = html.slice(0, 60000)
  const m =
    head.match(
      /<meta[^>]+(?:property|name)=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i,
    ) ||
    head.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image(?::url)?["']/i,
    )
  return m ? m[1] : null
}

async function fetchFeed(feed: {
  name: string
  url: string
}): Promise<NewsItem[]> {
  const xml = await fetchText(feed.url, 6000)
  if (!xml) return []
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  })
  const obj = parser.parse(xml)
  const items = toArray<Record<string, unknown>>(obj?.rss?.channel?.item)
  return items
    .map((it) => {
      const rawLink = it.link
      const link =
        typeof rawLink === "string"
          ? rawLink
          : text((rawLink as Record<string, unknown>)?.href)
      const pub = text(it.pubDate) || text(it.published) || text(it["dc:date"])
      const d = pub ? new Date(pub) : null
      return {
        title: decodeEntities(text(it.title).trim()),
        link: link.trim(),
        source: feed.name,
        date: d && !isNaN(d.getTime()) ? d.toISOString() : null,
        image: feedImage(it),
      }
    })
    .filter((i) => i.title && i.link)
}

/** Agrège quelques flux trail, dédoublonne, diversifie et illustre. */
export async function fetchTrailNews(limit = 8): Promise<NewsItem[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed))
  const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))

  const seen = new Set<string>()
  const deduped = all.filter((i) => {
    if (seen.has(i.link)) return false
    seen.add(i.link)
    return true
  })

  deduped.sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })

  // Priorité au contenu francophone : on remplit d'abord avec le FR (trié par
  // date, avec un plafond par source pour la diversité), puis l'international
  // ne sert qu'à compléter les places restantes.
  const perSource = 3
  const counts = new Map<string, number>()
  const picked: NewsItem[] = []
  const take = (pool: NewsItem[], cap: number) => {
    for (const item of pool) {
      if (picked.length >= limit) break
      const n = counts.get(item.source) ?? 0
      if (n < cap) {
        counts.set(item.source, n + 1)
        picked.push(item)
      }
    }
  }

  const frItems = deduped.filter((i) => FR_SOURCES.has(i.source))
  const intlItems = deduped.filter((i) => !FR_SOURCES.has(i.source))

  take(frItems, perSource) // FR d'abord
  take(intlItems, perSource) // international en complément
  // Au besoin, on relâche le plafond (FR encore prioritaire).
  if (picked.length < limit) {
    for (const item of [...frItems, ...intlItems]) {
      if (picked.length >= limit) break
      if (!picked.includes(item)) picked.push(item)
    }
  }
  const top = picked.slice(0, limit)

  // Complète les vignettes manquantes via l'og:image de l'article.
  await Promise.allSettled(
    top.map(async (item) => {
      if (!item.image) item.image = await ogImage(item.link)
    }),
  )

  return top
}
