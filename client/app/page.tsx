"use client";

import { useEffect, useState, useRef } from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SERVER = "http://localhost:8888";

type ButtonConfig = {
  id: string;
  label: string;
  icon: string;
  color: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function KeyIcon({ name, color }: { name: string; color: string }) {
  const Icon =
    (Icons as unknown as Record<string, LucideIcon>)[name] ??
    Icons.HelpCircle;

  return (
    <Icon
      size={27}
      strokeWidth={2}
      style={{
        color,
        filter: `drop-shadow(0 0 5px ${color}55)`,
      }}
    />
  );
}

export default function Home() {
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);
  const [status, setStatus] = useState("");
  const [pressed, setPressed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [landscape, setLandscape] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cyberdeck-landscape") === "1";
    }
    return false;
  });

  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  function toggleRotation() {
    setLandscape((prev) => {
      const next = !prev;
      localStorage.setItem("cyberdeck-landscape", next ? "1" : "0");
      return next;
    });
  }

  // PWA install prompt state
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  // Register service worker + listen for install prompt
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Hide the button if already installed (display-mode: standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    const prompt = deferredPrompt.current;
    if (!prompt) return;

    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
    }

    deferredPrompt.current = null;
  }

  async function loadConfig() {
    setLoading(true);

    try {
      const res = await fetch(`${SERVER}/config`);
      const data = await res.json();

      setButtons(data.buttons ?? []);
      setStatus("");
    } catch {
      setStatus("can't reach server — check adb reverse");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  async function fire(id: string) {
    setPressed(id);

    try {
      const res = await fetch(`${SERVER}/action/${id}`, {
        method: "POST",
      });

      setStatus(res.ok ? `${id} sent` : `${id} failed`);
    } catch {
      setStatus("can't reach server");
    } finally {
      setTimeout(() => setPressed(null), 150);
    }
  }

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
          transition: "transform 0.25s ease",
          // When rotated, the card's CSS width becomes its visual height
          // on screen (and vice-versa), so we cap against the swapped axis.
          maxWidth: landscape ? "90dvh" : "430px",
          maxHeight: landscape ? "90dvw" : "none",
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

          {/* Header */}
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
                  onClick={handleInstall}
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
                onClick={toggleRotation}
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

          {/* Keys */}
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-white/40 font-mono text-xs">
                loading config…
              </p>
            </div>
          ) : (
            <div className={`relative grid gap-3 ${landscape ? "grid-cols-4" : "grid-cols-3"}`}>
              {buttons.map((b) => {
                const isPressed = pressed === b.id;

                return (
                  <button
                    key={b.id}
                    onClick={() => fire(b.id)}
                    className="
                      group
                      relative
                      aspect-square
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
                      WebkitBackdropFilter:
                        "blur(18px) saturate(150%)",

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

                      filter: isPressed
                        ? "brightness(1.25)"
                        : "brightness(1)",
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
                        h-11
                        w-11
                        rounded-[13px]
                      "
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.025))",

                        border:
                          "1px solid rgba(255,255,255,0.08)",

                        boxShadow:
                          "inset 0 1px 1px rgba(255,255,255,0.12), 0 2px 5px rgba(0,0,0,0.45)",
                      }}
                    >
                      <KeyIcon name={b.icon} color={b.color} />
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
                      {b.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Bottom status */}
          <div className="relative flex items-center justify-between mt-5">
            <p className="text-[9px] font-mono text-white/30 truncate">
              {status || "ready"}
            </p>

            <button
              onClick={loadConfig}
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
        </div>
      </div>
    </main>
  );
}