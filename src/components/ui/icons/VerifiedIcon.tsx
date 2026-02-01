export default function VerifiedIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.5 2.5a2 2 0 013 0l.7.7c.3.3.7.4 1.1.3l1-.2a2 2 0 012.3 2.3l-.2 1c-.1.4 0 .8.3 1.1l.7.7a2 2 0 010 3l-.7.7c-.3.3-.4.7-.3 1.1l.2 1a2 2 0 01-2.3 2.3l-1-.2c-.4-.1-.8 0-1.1.3l-.7.7a2 2 0 01-3 0l-.7-.7c-.3-.3-.7-.4-1.1-.3l-1 .2a2 2 0 01-2.3-2.3l.2-1c.1-.4 0-.8-.3-1.1l-.7-.7a2 2 0 010-3l.7-.7c.3-.3.4-.7.3-1.1l-.2-1a2 2 0 012.3-2.3l1 .2c.4.1.8 0 1.1-.3l.7-.7zM9.7 10.3l-1.4 1.4L11 14.4l4.7-4.7-1.4-1.4L11 11.6l-1.3-1.3z" />
    </svg>
  );
}