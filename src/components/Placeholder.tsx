// Shown until a real product photo is uploaded.
export default function Placeholder({ label }: { label?: string | null }) {
  return (
    <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_40%,#2f5966,#132f38_75%)]">
      <div className="grid justify-items-center gap-2 text-white/70">
        <svg viewBox="0 0 64 64" className="size-14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 30h48M12 30v14a8 8 0 0 0 8 8h24a8 8 0 0 0 8-8V30M4 30h4M56 30h4M26 22c0-4 6-4 6-8M36 22c0-4 6-4 6-8" />
        </svg>
        {label && <span className="text-sm font-semibold tracking-wide">{label}</span>}
      </div>
    </div>
  );
}
