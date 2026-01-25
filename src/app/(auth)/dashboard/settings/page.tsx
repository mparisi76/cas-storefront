// app/(dashboard)/dashboard/settings/page.tsx
import { cookies } from "next/headers";
import { createDirectus, rest, staticToken, readMe } from "@directus/sdk";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { DirectusUser } from "@/types/user";
import { PasswordResetRequest } from "@/components/dashboard/PasswordResetRequest";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("directus_session")?.value;

  if (!token) redirect("/login");

  const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
    .with(staticToken(token))
    .with(rest());

  // Inside SettingsPage()
  const user = (await client.request(
    readMe({
      fields: [
        "first_name",
        "last_name",
        "email",
        "description",
        "shop_name",
        "phone",
        "city",
        "state",
        { role: ["name"] },
      ],
    }),
  )) as DirectusUser;

  return (
    <div className="max-w-4xl space-y-12 pb-20">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-zinc-900">
          Account Settings
        </h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">
          Manage your profile and portal preferences
        </p>
        <div className="h-px w-full bg-zinc-100 mt-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left: Section Label */}
        <div className="space-y-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
            Profile Information
          </h2>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Your identity within the CAS vendor system.
          </p>
        </div>

        {/* Right: The Client Form Component */}
        <ProfileForm user={user} />
      </div>

      <div className="h-px w-full bg-zinc-100" />

      {/* Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">
            Security
          </h2>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Update your password via secure email link.
          </p>
        </div>

        {/* Real functional component */}
        <PasswordResetRequest email={user.email} />
      </div>

      <div className="h-px w-full bg-zinc-100" />

      {/* Role Badge Footer */}
      <div className="bg-zinc-50 border border-zinc-100 p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
            Access Level
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
              {user.role?.name ?? "Vendor"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-zinc-500 italic">
            Connected to {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
