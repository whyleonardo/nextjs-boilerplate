import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

/**
 * Returns the current session or null.
 * Use this when you need the session data without enforcing authentication.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Requires an authenticated session.
 * Redirects to /sign-in if no session exists.
 * Use this at the top of protected Server Components / page.tsx files.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

/**
 * Requires NO authenticated session.
 * Redirects to /dashboard if a session already exists.
 * Use this at the top of auth pages (sign-in, sign-up).
 */
export async function requireGuest() {
  const session = await getSession();
  if (session) redirect("/dashboard");
}
