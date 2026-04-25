import { NextResponse, type NextRequest } from "next/server"
import { randomBytes } from "node:crypto"

const STRAVA_AUTHORIZE_URL = "https://www.strava.com/oauth/authorize"
const STRAVA_SCOPE = "read,activity:read_all,profile:read_all"

export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/auth/login?error=strava_not_configured", request.url)
    )
  }

  const { searchParams, origin } = request.nextUrl
  const next = searchParams.get("next") ?? "/app"

  const state = randomBytes(16).toString("hex")
  const redirectUri = `${origin}/auth/strava/callback`

  const authorizeUrl = new URL(STRAVA_AUTHORIZE_URL)
  authorizeUrl.searchParams.set("client_id", clientId)
  authorizeUrl.searchParams.set("redirect_uri", redirectUri)
  authorizeUrl.searchParams.set("response_type", "code")
  authorizeUrl.searchParams.set("approval_prompt", "auto")
  authorizeUrl.searchParams.set("scope", STRAVA_SCOPE)
  authorizeUrl.searchParams.set("state", state)

  const response = NextResponse.redirect(authorizeUrl)
  const secure = origin.startsWith("https://")

  response.cookies.set("strava_oauth_state", state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  })
  response.cookies.set("strava_oauth_next", next, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  })

  return response
}
