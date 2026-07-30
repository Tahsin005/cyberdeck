import * as Icons from "lucide-react";

interface DeckHeaderProps {
  showInstall: boolean;
  onInstall: () => void;
  landscape: boolean;
  onToggleRotation: () => void;
}

export function DeckHeader({
  showInstall,
  onInstall,
  landscape,
  onToggleRotation,
}: DeckHeaderProps) {
  return (
    <div className="relative flex items-center justify-between mb-5">
      <div>
        <h1 className="text-white text-lg font-semibold tracking-tight">
          Cyberdeck
        </h1>

        <p className="text-[9px] text-white/30 font-mono tracking-[0.2em] uppercase mt-0.5">
          control surface
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Install PWA button — only visible when not yet installed */}
        {showInstall && (
          <button
            onClick={onInstall}
            className="
              flex items-center gap-1.5
              text-[9px]
              font-mono
              text-emerald-400/80
              border
              border-emerald-400/20
              bg-emerald-400/[0.06]
              rounded-lg
              px-2.5
              py-1.5
              hover:bg-emerald-400/[0.12]
              hover:text-emerald-400
              hover:border-emerald-400/30
              transition-all
              duration-200
              animate-pulse
            "
            title="Install as app"
          >
            <Icons.Download size={11} strokeWidth={2.5} />
            install
          </button>
        )}

        {/* Rotate toggle */}
        <button
          onClick={onToggleRotation}
          className="
            flex items-center justify-center
            h-7
            w-7
            rounded-lg
            border
            border-white/10
            bg-white/[0.03]
            text-white/40
            hover:bg-white/[0.07]
            hover:text-white/60
            transition-all
            duration-200
          "
          title={landscape ? "Switch to portrait" : "Switch to landscape"}
        >
          <Icons.RotateCcw
            size={12}
            strokeWidth={2.5}
            style={{
              transform: landscape ? "rotate(-90deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </button>

        <div
          className="
            h-2
            w-2
            rounded-full
            bg-emerald-400
            shadow-[0_0_10px_rgba(52,211,153,0.8)]
          "
        />
      </div>
    </div>
  );
}
