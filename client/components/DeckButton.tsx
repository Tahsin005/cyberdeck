import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ButtonConfig } from "../types";

function KeyIcon({ name, color }: { name: string; color: string }) {
  const Icon =
    (Icons as unknown as Record<string, LucideIcon>)[name] ??
    Icons.HelpCircle;

  return (
    <Icon
      className="w-[60%] h-[60%]"
      strokeWidth={2}
      style={{
        color,
        filter: `drop-shadow(0 0 5px ${color}55)`,
      }}
    />
  );
}

interface DeckButtonProps {
  button: ButtonConfig;
  isPressed: boolean;
  onFire: (id: string) => void;
}

export function DeckButton({ button, isPressed, onFire }: DeckButtonProps) {
  return (
    <button
      onClick={() => onFire(button.id)}
      className="
        group
        absolute
        inset-0
        w-full
        h-full
        overflow-hidden
        rounded-[18px]
        flex
        flex-col
        items-center
        justify-center
        gap-2
        transition-all
        duration-150
        active:duration-75
      "
      style={{
        transform: isPressed
          ? "translateY(2px) scale(0.94)"
          : "translateY(0) scale(1)",

        background: `
          linear-gradient(
            145deg,
            rgba(255,255,255,0.16) 0%,
            rgba(255,255,255,0.06) 35%,
            rgba(255,255,255,0.025) 100%
          )
        `,

        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",

        border: "1px solid rgba(255,255,255,0.14)",

        boxShadow: isPressed
          ? `
            inset 0 1px 2px rgba(255,255,255,0.16),
            inset 0 -2px 5px rgba(0,0,0,0.5),
            0 2px 4px rgba(0,0,0,0.7)
          `
          : `
            inset 0 1px 1px rgba(255,255,255,0.18),
            inset 0 -1px 2px rgba(0,0,0,0.5),
            0 5px 10px rgba(0,0,0,0.65),
            0 1px 2px rgba(0,0,0,0.8)
          `,

        filter: isPressed ? "brightness(1.25)" : "brightness(1)",
      }}
    >
      {/* Glass highlight */}
      <span
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-[45%]
          rounded-t-[18px]
        "
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.11), rgba(255,255,255,0))",
        }}
      />

      {/* Top-left glass reflection */}
      <span
        className="
          pointer-events-none
          absolute
          -top-8
          -left-8
          w-20
          h-20
          rounded-full
          bg-white/[0.06]
          blur-xl
        "
      />

      {/* Icon */}
      <span
        className="
          relative
          z-10
          flex
          items-center
          justify-center
          h-[45%]
          aspect-square
          max-h-[80px]
          rounded-[25%]
        "
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.025))",

          border: "1px solid rgba(255,255,255,0.08)",

          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.12), 0 2px 5px rgba(0,0,0,0.45)",
        }}
      >
        <KeyIcon name={button.icon} color={button.color} />
      </span>

      {/* Label */}
      <span
        className="
          relative
          z-10
          text-[9px]
          font-mono
          text-white/55
          tracking-wider
          uppercase
        "
      >
        {button.label}
      </span>
    </button>
  );
}
