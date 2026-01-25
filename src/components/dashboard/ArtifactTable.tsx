"use client";

import { useState } from "react";
import Link from "next/link";
import { Artifact } from "@/types/artifact";
import { vendorArtifactService } from "@/services/(vendor)/artifacts";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { ConfirmDeleteModal } from "./modals/ConfirmDeleteModal";

interface ArtifactTableProps {
  items: Artifact[];
  token: string;
}

export function ArtifactTable({ items, token }: ArtifactTableProps) {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const hasSelection = selectedIds.length > 0;

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const toggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    const idsToString = selectedIds.map((id) => String(id));
    const result = await vendorArtifactService.bulkDelete(token, idsToString);

    if (result.success) {
      showToast(`${selectedIds.length} artifacts deleted.`);
      setSelectedIds([]);
      setIsDeleteModalOpen(false);
      router.refresh();
    } else {
      showToast("Deletion failed.");
    }
    setIsProcessing(false);
  };

  const handleBulkStatusUpdate = async (newStatus: "available" | "sold") => {
    setIsProcessing(true);
    const idsToString = selectedIds.map((id) => String(id));
    const result = await vendorArtifactService.bulkUpdateStatus(
      token,
      idsToString,
      newStatus,
    );

    if (result.success) {
      showToast(`Updated ${selectedIds.length} items to ${newStatus}.`);
      setSelectedIds([]);
      router.refresh();
    } else {
      showToast("Update failed.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      {/* Selection Toolbar */}
      <div className="h-14 overflow-hidden relative">
        <div
          className={`w-full flex items-center justify-between bg-zinc-900 text-white px-6 py-3 shadow-xl 
                     transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
                       hasSelection
                         ? "translate-y-0 opacity-100"
                         : "-translate-y-full opacity-0 pointer-events-none"
                     }`}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Selected
              </span>
              <span className="bg-zinc-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {selectedIds.length}
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-700" />

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleBulkStatusUpdate("available")}
                disabled={isProcessing}
                className="text-[9px] font-bold uppercase tracking-widest hover:text-green-400 transition-colors disabled:opacity-50"
              >
                Mark Available
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("sold")}
                disabled={isProcessing}
                className="text-[9px] font-bold uppercase tracking-widest hover:text-orange-400 transition-colors disabled:opacity-50"
              >
                Mark Sold
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isProcessing}
            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            Delete Permanently
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-100 shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 w-12">
                <input
                  type="checkbox"
                  className="accent-zinc-900 cursor-pointer"
                  onChange={toggleSelectAll}
                  checked={
                    selectedIds.length === items.length && items.length > 0
                  }
                />
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Artifact Description
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">
                Price
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">
                Options
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={`${selectedIds.includes(item.id) ? "bg-zinc-50" : "hover:bg-zinc-50/50"} transition-colors cursor-default`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.tagName !== "A" &&
                      target.tagName !== "INPUT" &&
                      !target.closest("a")
                    ) {
                      toggleSelect(item.id);
                    }
                  }}
                >
                  <td className="px-6 py-6">
                    <input
                      type="checkbox"
                      className="accent-zinc-900 cursor-pointer"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-6 py-6 text-sm font-medium text-zinc-800">
                    {item.name}
                  </td>
                  <td className="px-6 py-6">
                    <span
                      className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        item.availability === "available"
                          ? "bg-green-50 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {item.availability}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-sm text-zinc-600 text-right font-mono">
                    ${Number(item.purchase_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <Link
                      href={`/dashboard/artifact/edit/${item.id}`}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-20 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                >
                  No artifacts listed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title={
          selectedIds.length === 1
            ? items.find((i) => i.id === selectedIds[0])?.name || "Artifact"
            : `${selectedIds.length} Selected Artifacts`
        }
        isPending={isProcessing}
      />
    </div>
  );
}
