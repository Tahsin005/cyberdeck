"use client";

import { useCyberdeckConfig } from "../hooks/useCyberdeckConfig";
import { useLandscapeMode } from "../hooks/useLandscapeMode";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { DeckHeader } from "../components/DeckHeader";
import { DeckButton } from "../components/DeckButton";
import { DeckFooter } from "../components/DeckFooter";

export default function Home() {
  const { buttons, status, pressed, loading, loadConfig, fire } =
    useCyberdeckConfig();
  const { flipped, ready, toggleRotation } = useLandscapeMode();
  const { showInstall, handleInstall } = usePWAInstall();

  return (
    <main
      className="bg-black flex items-center justify-center"
      style={{
        position: "fixed",
        inset: 0,
        width: "100dvw",
        height: "100dvh",
        padding: "16px",
      }}
    >
      {/* Device card — rotation lives here, not on <main> */}
      <div
        className="
          relative
          w-full
          flex-shrink-0
          rounded-[34px]
          p-[10px]
          shadow-[0_35px_80px_rgba(0,0,0,0.85)]
        "
        style={{
          background:
            "linear-gradient(145deg, #343434 0%, #111 38%, #050505 100%)",
          // Smooth in-place rotation — immune to address-bar resize
          transform: flipped ? "rotate(-90deg)" : "rotate(90deg)",
          transformOrigin: "center center",
          transition: "transform 0.25s ease, width 0.25s ease, height 0.25s ease",
          // When rotated, CSS width is the on-screen physical height.
          // We expand it to fill the long edge of the phone.
          width: "calc(100dvh - 48px)",
          height: "calc(100dvw - 48px)",
          maxWidth: "none",
          // Hide until client has mounted to prevent portrait→landscape flash
          visibility: ready ? "visible" : "hidden",
        }}
      >
        {/* Inner deck */}
        <div
          className="
            relative
            rounded-[27px]
            p-5
            overflow-hidden
            flex
            flex-col
            h-full
          "
          style={{
            background:
              "linear-gradient(145deg, #181818 0%, #090909 55%, #030303 100%)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.10), inset 0 -2px 5px rgba(0,0,0,0.9)",
          }}
        >
          {/* subtle reflection */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-40
            "
            style={{
              background:
                "linear-gradient(125deg, rgba(255,255,255,0.08), transparent 25%, transparent 70%, rgba(255,255,255,0.025))",
            }}
          />

          <DeckHeader
            showInstall={showInstall}
            onInstall={handleInstall}
            flipped={flipped}
            onToggleRotation={toggleRotation}
          />

          {/* Keys */}
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-white/40 font-mono text-xs">
                loading config…
              </p>
            </div>
          ) : (
            <div 
              className="relative flex-1 grid gap-3 overflow-hidden pr-1 grid-cols-5 grid-rows-2 w-full h-full"
              style={{ scrollbarWidth: "none" }}
            >
              {Array.from({ length: 10 }).map((_, index) => {
                const b = buttons[index];
                return (
                  <div
                    key={b?.id || `empty-${index}`}
                    className="
                      relative
                      w-full
                      h-full
                      rounded-[18px]
                      border
                      border-white/10
                    "
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {b && (
                      <DeckButton
                        button={b}
                        isPressed={pressed === b.id}
                        onFire={fire}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <DeckFooter status={status} onReload={loadConfig} />
        </div>
      </div>
    </main>
  );
}