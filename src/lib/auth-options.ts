import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

// In-memory brute-force guard keyed by lowercase email.
// 5 consecutive failures → 15-minute lockout.
const _fl = (global as typeof global & { _fl: Map<string, { count: number; lockedUntil: number }> })
if (!_fl._fl) _fl._fl = new Map()
const failedLogins = _fl._fl

function isLocked(email: string): boolean {
  const e = failedLogins.get(email)
  return !!e && Date.now() < e.lockedUntil
}
function recordFail(email: string): void {
  const e = failedLogins.get(email) ?? { count: 0, lockedUntil: 0 }
  e.count++
  if (e.count >= 5) { e.lockedUntil = Date.now() + 15 * 60 * 1000; e.count = 0 }
  failedLogins.set(email, e)
}
function clearFail(email: string): void { failedLogins.delete(email) }

// Fail fast in production if the JWT signing secret is the insecure dev fallback.
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXTAUTH_SECRET
) {
  throw new Error(
    "NEXTAUTH_SECRET is not set. Generate one with: openssl rand -base64 32"
  )
}

// Google OAuth is optional — only enabled when both credentials are provided.
// Register credentials at https://console.cloud.google.com/apis/credentials
// Authorised redirect URI must include: https://YOUR_DOMAIN/api/auth/callback/google
const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              // Request offline access so the refresh token is returned
              access_type: "offline",
              prompt: "consent",
            },
          },
        }),
      ]
    : []

export const authOptions: NextAuthOptions = {
  providers: [
    ...googleProvider,
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email.toLowerCase().trim()

        if (isLocked(email)) {
          throw new Error("Akaun dikunci sementara. Cuba lagi dalam 15 minit.")
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.passwordHash) {
          recordFail(email)
          return null
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) {
          recordFail(email)
          return null
        }

        clearFail(email)
        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],

  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET ?? "kad-dev-secret-change-in-production",

  callbacks: {
    // Fires on every sign-in. For Google: upsert the user row.
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await prisma.user.upsert({
          where:  { email: user.email },
          create: { email: user.email, name: user.name, image: user.image },
          update: { name: user.name, image: user.image },
        })
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          // signIn upserted the user — now fetch the real DB id
          const dbUser = await prisma.user.findUnique({ where: { email: token.email! } })
          token.id = dbUser?.id
        } else {
          token.id = user.id
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },
}
