import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSessionValid } from "@/lib/directus-auth";
import { ToastProvider } from "@/context/ToastContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KeepAlive } from "@/components/dashboard/KeepAlive";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  // 1. Presence Check
  if (!token) {
    redirect("/login");
  }

  // 2. Deep Check (Validation)
  const valid = await isSessionValid(token);
  
  if (!valid) {
    // If the token is stale, we redirect. 
    // The user's browser still has the cookie, but the login page 
    // logic should overwrite/clear it when they arrive.
    redirect("/login?error=session_expired");
  }

  return (
    <ToastProvider>
			<KeepAlive />
      <div className="min-h-screen bg-white flex flex-col">
        <DashboardHeader />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}