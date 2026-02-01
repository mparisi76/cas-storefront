"use client";

import { Modal } from "@/components/ui/Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isPending?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isPending,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-red-600">
            Confirm Delete
          </h2>
          <p className="text-xl font-light tracking-tight text-zinc-900 italic">
            {`"${title}"`}
          </p>
        </div>
        
        <p className="text-[15px] text-zinc-500 leading-relaxed">
          Are you sure you want to remove this selection from your collection? This action is permanent and cannot be undone.
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="w-full bg-red-600 text-white py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {isPending ? "Removing..." : "Permanently Delete"}
          </button>
          <button
            onClick={onClose}
            className="w-full border border-zinc-200 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-900 hover:border-zinc-900 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}