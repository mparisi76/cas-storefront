"use client";

import { useActionState, useEffect, useState, useMemo } from "react";
import { updateProfileAction } from "@/app/actions/auth/update-profile";
import { useToast } from "@/context/ToastContext";
import { DirectusUser } from "@/types/user";

export function ProfileForm({ user }: { user: DirectusUser }) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    null,
  );

  // 1. Local State for Controlled Inputs
  const [formData, setFormData] = useState({
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    shop_name: user.shop_name ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    phone: user.phone ?? "",
  });

  // 2. Dirty Check Logic
  const isDirty = useMemo(() => {
    return (
      formData.first_name !== (user.first_name ?? "") ||
      formData.last_name !== (user.last_name ?? "") ||
      formData.shop_name !== (user.shop_name ?? "") ||
      formData.city !== (user.city ?? "") ||
      formData.state !== (user.state ?? "") ||
      formData.phone !== (user.phone ?? "")
    );
  }, [formData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Simple Toast Handlers
  useEffect(() => {
    if (state?.success) showToast("Profile updated successfully");
    if (state?.error)
      showToast(
        state.error === "SESSION_EXPIRED"
          ? "Session expired. Please log in."
          : "Update failed",
      );
  }, [state, showToast]);

  return (
    <form action={formAction} className="md:col-span-2 space-y-10">
      {/* Personal Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
            Personal Details
          </h3>
          {isDirty && (
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest animate-pulse">
              Unsaved Changes
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              First Name
            </label>
            <input
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Last Name
            </label>
            <input
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Shop Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 border-b border-zinc-100 pb-2">
          Shop Identity
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Shop Name
            </label>
            <input
              name="shop_name"
              type="text"
              value={formData.shop_name}
              onChange={handleChange}
              className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                City
              </label>
              <input
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                State
              </label>
              <input
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-zinc-100">
        {isDirty && (
          <button
            type="button"
            onClick={() =>
              setFormData({
                first_name: user.first_name ?? "",
                last_name: user.last_name ?? "",
                shop_name: user.shop_name ?? "",
                city: user.city ?? "",
                state: user.state ?? "",
                phone: user.phone ?? "",
              })
            }
            className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
          >
            Reset
          </button>
        )}
        <button
          type="submit"
          disabled={!isDirty || isPending}
          className="px-8 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all"
        >
          {isPending ? "Saving..." : isDirty ? "Save Changes" : "Up to Date"}
        </button>
      </div>
    </form>
  );
}
