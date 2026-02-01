export default function StarIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      stroke="none"
    >
      <path d="M12 1.75l3.09 6.26L22 8.98l-5 4.87 1.18 6.88L12 17.48l-6.18 3.25L7 13.85 2 8.98l6.91-.97L12 1.75z" />
    </svg>
  );
}