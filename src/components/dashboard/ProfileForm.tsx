"use client";

import { useActionState, useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ImagePlus, Trash2, ExternalLink } from "lucide-react";
import { updateProfileAction } from "@/app/actions/auth/update-profile";
import { useToast } from "@/context/ToastContext";
import { DirectusUser } from "@/types/user";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const DESCRIPTION_MAX = 1500;

const inputClass =
  "w-full bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-900 outline-none";
const labelClass = "text-[9px] font-black uppercase tracking-widest text-zinc-500";

function initialValues(user: DirectusUser) {
  return {
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    phone: user.phone ?? "",
    shop_name: user.shop_name ?? "",
    description: user.description ?? "",
    avatar: user.avatar ?? "",
    street_address: user.street_address ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    zip_code: user.zip_code ?? "",
    // Optional separate ship-from address ("1" = enabled)
    ship_from_enabled: user.ship_from_street || user.ship_from_zip ? "1" : "",
    ship_from_street: user.ship_from_street ?? "",
    ship_from_city: user.ship_from_city ?? "",
    ship_from_state: user.ship_from_state ?? "",
    ship_from_zip: user.ship_from_zip ?? "",
  };
}

/** Street / City / State / ZIP block, used for both the shop and ship-from addresses. */
function AddressFields({
  prefix,
  values,
  onChange,
}: {
  prefix: "" | "ship_from_";
  values: { street: string; city: string; state: string; zip: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const n = (field: "street" | "city" | "state" | "zip") =>
    prefix ? `ship_from_${field}` : field === "street" ? "street_address" : field === "zip" ? "zip_code" : field;
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className={labelClass}>Street Address</label>
        <input name={n("street")} type="text" autoComplete="address-line1" value={values.street} onChange={onChange} className={inputClass} />
      </div>
      <div className="grid grid-cols-6 gap-4">
        <div className="space-y-1.5 col-span-3">
          <label className={labelClass}>City</label>
          <input name={n("city")} type="text" autoComplete="address-level2" value={values.city} onChange={onChange} className={inputClass} />
        </div>
        <div className="space-y-1.5 col-span-1">
          <label className={labelClass}>State</label>
          <input
            name={n("state")}
            type="text"
            maxLength={2}
            placeholder="NY"
            autoComplete="address-level1"
            value={values.state}
            onChange={onChange}
            className={`${inputClass} uppercase`}
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className={labelClass}>ZIP</label>
          <input
            name={n("zip")}
            type="text"
            inputMode="numeric"
            maxLength={5}
            autoComplete="postal-code"
            value={values.zip}
            onChange={onChange}
            className={`${inputClass} font-mono`}
          />
        </div>
      </div>
    </div>
  );
}

export function ProfileForm({
  user,
  shopUrl,
  shipFromSupported = false,
}: {
  user: DirectusUser;
  shopUrl?: string | null;
  /** False until the ship_from_* fields exist in Directus; hides that option. */
  shipFromSupported?: boolean;
}) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  const [formData, setFormData] = useState(() => initialValues(user));
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const isDirty = useMemo(() => {
    const initial = initialValues(user);
    return (Object.keys(initial) as (keyof typeof initial)[]).some((k) => formData[k] !== initial[k]);
  }, [formData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Logo uploads immediately (same endpoint as listing photos); the file ID is
  // saved to the profile when the vendor clicks Save Changes.
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingLogo(true);
    try {
      const body = new FormData();
      body.append("files", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result?.error || "Upload failed.");
      const id = Array.isArray(result) ? result[0]?.id : result?.id;
      if (!id) throw new Error("Upload failed.");
      setFormData((prev) => ({ ...prev, avatar: id }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (state?.success) showToast("Profile updated successfully");
    if (state?.error)
      showToast(
        state.error === "SESSION_EXPIRED" || state.error === "AUTH_EXPIRED"
          ? "Session expired. Please log in."
          : state.error === "UPDATE_FAILED"
            ? "Update failed"
            : state.error,
      );
  }, [state, showToast]);

  return (
    <form action={formAction} className="md:col-span-2 space-y-10">
      {/* Personal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Personal Details</h3>
          {isDirty && (
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest animate-pulse">
              Unsaved Changes
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>First Name</label>
            <input name="first_name" type="text" value={formData.first_name} onChange={handleChange} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Last Name</label>
            <input name="last_name" type="text" value={formData.last_name} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Phone</label>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass}
          />
          <p className="text-[10px] text-zinc-500">Private. Only used by the shop team to reach you about orders.</p>
        </div>
      </div>

      {/* Public shop profile */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Shop Profile</h3>
          {shopUrl && (
            <Link
              href={shopUrl}
              target="_blank"
              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-zinc-900"
            >
              View your shop page <ExternalLink size={10} />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 shrink-0 rounded-full border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center">
            {formData.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${DIRECTUS_URL}/assets/${formData.avatar}?width=160&height=160&fit=cover`}
                alt="Shop logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlus size={20} className="text-zinc-500" />
            )}
          </div>
          <div className="space-y-2">
            <p className={labelClass}>Shop Logo</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => fileInput.current?.click()}
                className="px-3 py-2 border border-zinc-200 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 disabled:opacity-50"
              >
                {uploadingLogo ? "Uploading..." : formData.avatar ? "Replace" : "Upload"}
              </button>
              {formData.avatar && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, avatar: "" }))}
                  className="px-3 py-2 border border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-200"
                  aria-label="Remove logo"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-zinc-500">Square images work best. JPEG, PNG, or WebP, under 10 MB.</p>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={handleLogoUpload}
            />
            <input type="hidden" name="avatar" value={formData.avatar} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Shop Name</label>
          <input name="shop_name" type="text" value={formData.shop_name} onChange={handleChange} className={inputClass} />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className={labelClass}>About Your Shop</label>
            <span className="text-[9px] text-zinc-500 font-mono">
              {formData.description.length}/{DESCRIPTION_MAX}
            </span>
          </div>
          <textarea
            name="description"
            rows={5}
            maxLength={DESCRIPTION_MAX}
            value={formData.description}
            onChange={handleChange}
            placeholder="What you specialize in, where your pieces come from, how long you've been at it..."
            className={`${inputClass} leading-relaxed`}
          />
          <p className="text-[10px] text-zinc-500">Shown on your public shop page.</p>
        </div>

      </div>

      {/* Shop address (city/state public; street/ZIP private) */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 border-b border-zinc-100 pb-2">
          Shop Address
        </h3>
        <AddressFields
          prefix=""
          values={{ street: formData.street_address, city: formData.city, state: formData.state, zip: formData.zip_code }}
          onChange={handleChange}
        />
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Only your <strong>city and state</strong> are shown publicly, on your shop page and listings. Street and ZIP
          stay private{shipFromSupported ? "" : " and are used to calculate shipping rates"}.
        </p>

        {shipFromSupported && (
          <div className="pt-2 space-y-4">
            <input type="hidden" name="ship_from_supported" value="1" />
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="ship_from_enabled"
                value="1"
                checked={formData.ship_from_enabled === "1"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ship_from_enabled: e.target.checked ? "1" : "" }))
                }
                className="h-4 w-4 accent-zinc-900"
              />
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">
                Ship from a different address
              </span>
            </label>

            {formData.ship_from_enabled === "1" ? (
              <div className="border-l-2 border-zinc-200 pl-4 space-y-3">
                <AddressFields
                  prefix="ship_from_"
                  values={{
                    street: formData.ship_from_street,
                    city: formData.ship_from_city,
                    state: formData.ship_from_state,
                    zip: formData.ship_from_zip,
                  }}
                  onChange={handleChange}
                />
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Private. Shipping rates are calculated from this address instead of your shop address.
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Shipping rates are calculated from your shop address. Tick this if you ship from a warehouse or storage
                unit.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-zinc-100">
        {isDirty && (
          <button
            type="button"
            onClick={() => setFormData(initialValues(user))}
            className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
          >
            Reset
          </button>
        )}
        <button
          type="submit"
          disabled={!isDirty || isPending || uploadingLogo}
          className="px-8 py-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all"
        >
          {isPending ? "Saving..." : isDirty ? "Save Changes" : "Up to Date"}
        </button>
      </div>
    </form>
  );
}
