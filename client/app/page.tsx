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
  const { landscape, ready, toggleRotation } = useLandscapeMode();
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
          transform: landscape ? "rotate(90deg)" : "rotate(0deg)",
          transformOrigin: "center center",
          transition: "transform 0.25s ease, width 0.25s ease, height 0.25s ease",
          // When rotated, CSS width is the on-screen physical height.
          // We expand it to fill the long edge of the phone.
          width: landscape ? "calc(100dvh - 48px)" : "100%",
          height: landscape ? "calc(100dvw - 48px)" : "auto",
          maxWidth: landscape ? "none" : "430px",
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
            landscape={landscape}
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
            <div className={`relative flex-1 content-start grid gap-3 ${landscape ? "grid-cols-5" : "grid-cols-3"}`}>
              {buttons.map((b) => (
                <DeckButton
                  key={b.id}
                  button={b}
                  isPressed={pressed === b.id}
                  onFire={fire}
                />
              ))}
            </div>
          )}

          <DeckFooter status={status} onReload={loadConfig} />
        </div>
      </div>
    </main>
  );
}