import StarIcon from "@/components/ui/icons/StarIcon";

export default function FeaturedBadge({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <div className={`
      flex items-center gap-1.5 bg-blue-600 text-white px-2 py-1 
      text-[9px] font-black uppercase tracking-[0.2em] shadow-lg
      ${horizontal ? "rounded-none" : "absolute top-0 left-0 z-20"}
    `}>
      <StarIcon className="w-2.5 h-2.5" />
      <span>Featured</span>
    </div>
  );
}