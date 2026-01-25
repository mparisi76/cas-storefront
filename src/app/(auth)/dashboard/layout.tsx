import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSessionValid } from "@/lib/directus-auth";
import { ToastProvider } from "@/context/ToastContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KeepAlive } from "@/components/dashboard/KeepAlive";
import { createDirectus, rest, staticToken, readMe } from "@directus/sdk";

// Define the interface to match what the Header expects
interface UserData {
  name: string;
  email: string;
  role: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) redirect("/login");

  const valid = await isSessionValid(token);
  if (!valid) redirect("/login?error=session_expired");

  // Initialize as undefined instead of null to match 'UserProps | undefined'
  let userData: UserData | undefined = undefined;

  try {
    const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(staticToken(token))
      .with(rest());

    // Specify the types in the request to avoid 'any'
    const user = await client.request(readMe({
      fields: ['first_name', 'last_name', 'email', { role: ['name'] }]
    })) as { 
      first_name: string; 
      last_name: string; 
      email: string; 
      role?: { name: string } 
    };

    userData = {
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Archivist",
      email: user.email || "",
      role: user.role?.name || "Vendor"
    };
  } catch (e) {
    console.error("Failed to fetch user data", e);
    // userData remains undefined, which the Header handles gracefully
  }

  return (
    <ToastProvider>
      <KeepAlive />
      <div className="min-h-screen bg-white flex flex-col">
        <DashboardHeader user={userData} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
