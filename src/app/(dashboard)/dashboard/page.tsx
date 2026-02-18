import { requireSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const { user } = await requireSession();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">
        Signed in as {user.email}
      </p>
    </div>
  );
}
