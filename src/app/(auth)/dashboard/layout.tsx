import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSessionValid } from "@/lib/directus-auth";
import { loadHeaderUser } from "@/lib/header-user";
import SiteHeader from "@/components/layout/SiteHeader";
import Footer from "@/components/inventory/Footer";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("directus_session")?.value;
  if (!token) redirect("/login");

  const valid = await isSessionValid(token);
  if (!valid) redirect("/login?error=session_expired");

  // Same header as the storefront, with the user server-rendered (no flicker).
  const user = await loadHeaderUser(token);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader user={user} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
