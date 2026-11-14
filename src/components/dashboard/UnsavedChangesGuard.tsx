"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

/**
 * Warns before losing unsaved form changes.
 * - Refresh / close tab / typed URL: the browser's own "Leave site?" dialog
 *   (browsers don't allow custom modals there).
 * - Clicking an in-app link: our modal, with Keep editing / Leave without saving.
 *
 * `isDirty` is a function so it can check live state (e.g. uploaded photos)
 * at the moment the user tries to leave.
 *
 * Returns a `confirmLeave(href | "back")` helper for buttons like Cancel.
 */
export function useUnsavedChangesGuard(isDirty: () => boolean) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null); // href, or "back"
  const dirtyRef = useRef(isDirty);
  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  // Browser-level: refresh, close tab, external navigation.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current()) return;
      e.preventDefault();
      e.returnValue = ""; // required by some browsers to show the dialog
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // In-app links (header, footer, breadcrumbs...): intercept before Next navigates.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return; // external: beforeunload handles it
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!dirtyRef.current()) return;
      e.preventDefault();
      e.stopPropagation();
      setPending(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true); // capture phase, before Next's Link handler
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const confirmLeave = useCallback(
    (target: string) => {
      if (!dirtyRef.current()) {
        if (target === "back") router.back();
        else router.push(target);
        return;
      }
      setPending(target);
    },
    [router],
  );

  const modal = (
    <Modal isOpen={pending !== null} onClose={() => setPending(null)}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-zinc-900">Unsaved changes</h2>
          <p className="text-[15px] text-zinc-600 leading-relaxed">
            You have changes that haven&apos;t been saved. If you leave now, they&apos;ll be lost.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setPending(null)}
            className="w-full bg-zinc-900 text-white py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={() => {
              const target = pending;
              setPending(null);
              dirtyRef.current = () => false; // don't warn again on the way out
              if (target === "back") router.back();
              else if (target) router.push(target);
            }}
            className="w-full border border-zinc-200 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            Leave without saving
          </button>
        </div>
      </div>
    </Modal>
  );

  return { confirmLeave, modal };
}
