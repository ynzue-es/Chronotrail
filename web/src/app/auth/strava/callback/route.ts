import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"

type StravaTokenResponse = {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete: {
    id: number
    firstname?: string
    lastname?: string
    profile?: string
    city?: string
    country?: string
  }
}

function safeNext(next: string | undefined): string {
  if (!next) return "/app"
  if (!next.startsWith("/") || next.startsWith("//")) return "/app"
  return next
}

function redirectWithError(request: NextRequest, error: string) {
  const url = new URL("/auth/login", request.url)
  url.searchParams.set("error", error)
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return redirectWithError(request, "strava_not_configured")
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const stravaError = searchParams.get("error")

  if (stravaError) {
    return redirectWithError(request, stravaError)
  }
  if (!code || !state) {
    return redirectWithError(request, "missing_code_or_state")
  }

  const expectedState = request.cookies.get("strava_oauth_state")?.value
  const next = safeNext(request.cookies.get("strava_oauth_next")?.value)

  if (!expectedState || expectedState !== state) {
    return redirectWithError(request, "invalid_state")
  }

  let tokenResponse: StravaTokenResponse
  try {
    const res = await fetch(STRAVA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    })
    if (!res.ok) {
      return redirectWithError(request, "strava_token_exchange_failed")
    }
    tokenResponse = (await res.json()) as StravaTokenResponse
  } catch {
    return redirectWithError(request, "strava_network_error")
  }

  const { athlete, access_token, refresh_token, expires_at } = tokenResponse

  // Strava does not return an email. We use a stable synthetic email tied to
  // the Strava athlete id so we can link a Supabase user to this identity.
  const email = `strava-${athlete.id}@strava.chronotrail.local`

  const admin = createAdminClient()

  const { data: existing, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  })
  if (listError) {
    return redirectWithError(request, "supabase_admin_error")
  }

  const userMetadata = {
    provider: "strava",
    strava_id: athlete.id,
    strava_access_token: access_token,
    strava_refresh_token: refresh_token,
    strava_expires_at: expires_at,
    firstname: athlete.firstname ?? null,
    lastname: athlete.lastname ?? null,
    avatar_url: athlete.profile ?? null,
    city: athlete.city ?? null,
    country: athlete.country ?? null,
  }

  // listUsers filter-by-email isn't supported via the JS SDK; we upsert.
  void existing
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: userMetadata,
  })

  let userId = created?.user?.id
  if (createError && !userId) {
    // Already exists — find and update.
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 })
    const match = list?.users.find((u) => u.email === email)
    if (!match) {
      return redirectWithError(request, "supabase_create_user_failed")
    }
    userId = match.id
    await admin.auth.admin.updateUserById(match.id, {
      user_metadata: { ...match.user_metadata, ...userMetadata },
    })
  }

  // Generate a magic link and redirect the user through it to create a session.
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${request.nextUrl.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (linkError || !link?.properties?.action_link) {
    return redirectWithError(request, "magiclink_generation_failed")
  }

  const response = NextResponse.redirect(link.properties.action_link)
  response.cookies.delete("strava_oauth_state")
  response.cookies.delete("strava_oauth_next")
  return response
}
