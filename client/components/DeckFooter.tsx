interface DeckFooterProps {
  status: string;
  onReload: () => void;
}

export function DeckFooter({ status, onReload }: DeckFooterProps) {
  return (
    <div className="relative flex items-center justify-between mt-5">
      <p className="text-[9px] font-mono text-white/30 truncate">
        {status || "ready"}
      </p>

      <button
        onClick={onReload}
        className="
          text-[9px]
          font-mono
          text-white/40
          border
          border-white/10
          bg-white/[0.03]
          rounded-lg
          px-2.5
          py-1.5
          hover:bg-white/[0.07]
          hover:text-white/60
          transition-colors
        "
      >
        ↻ reload
      </button>
    </div>
  );
}
