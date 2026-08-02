"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useCyberdeckConfig } from "../../hooks/useCyberdeckConfig";
import { useLandscapeMode } from "../../hooks/useLandscapeMode";
import { DeckButton } from "../../components/DeckButton";
import { ButtonConfig } from "../../types";

const SERVER = "http://localhost:8888";

function SortableItem({ button }: { button: ButtonConfig }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: button.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="relative w-full h-full cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="pointer-events-none w-full h-full">
        <DeckButton button={button} isPressed={false} onFire={() => {}} />
      </div>
    </div>
  );
}

export default function ArrangePage() {
  const { buttons, loading, loadConfig } = useCyberdeckConfig();
  const { flipped, ready } = useLandscapeMode();
  const router = useRouter();

  const [items, setItems] = useState<ButtonConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(buttons);
  }, [buttons]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function scrollUp() {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -200, behavior: "smooth" });
    }
  }

  function scrollDown() {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 200, behavior: "smooth" });
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${SERVER}/update-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buttons: items }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        alert("Failed to save config.");
      }
    } catch (e) {
      alert("Error saving config.");
    } finally {
      setSaving(false);
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
          background: "linear-gradient(145deg, #343434 0%, #111 38%, #050505 100%)",
          transform: flipped ? "rotate(-90deg)" : "rotate(90deg)",
          transformOrigin: "center center",
          transition: "transform 0.25s ease, width 0.25s ease, height 0.25s ease",
          width: "calc(100dvh - 48px)",
          height: "calc(100dvw - 48px)",
          maxWidth: "none",
          visibility: ready ? "visible" : "hidden",
        }}
      >
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
            background: "linear-gradient(145deg, #181818 0%, #090909 55%, #030303 100%)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.10), inset 0 -2px 5px rgba(0,0,0,0.9)",
          }}
        >
          <div className="relative flex items-center justify-between mb-5">
            <div>
              <h1 className="text-white text-lg font-semibold tracking-tight">Arrange</h1>
              <p className="text-[9px] text-emerald-400 font-mono tracking-[0.2em] uppercase mt-0.5 animate-pulse">Drag to reorder</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/")}
                className="text-[9px] font-mono text-white/40 border border-white/10 bg-white/[0.03] rounded-lg px-2.5 py-1.5"
              >
                cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-[9px] font-mono text-black border border-emerald-400 bg-emerald-400 rounded-lg px-2.5 py-1.5 opacity-90 hover:opacity-100 transition-opacity"
              >
                {saving ? "saving..." : "save"}
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex flex-row min-h-0 gap-3">
            <div 
              ref={scrollRef}
              className="flex-1 min-h-0 grid gap-3 overflow-y-auto pr-1 grid-cols-5"
              style={{ 
                scrollbarWidth: "none",
                gridAutoRows: "calc(50% - 6px)",
              }}
            >
            {loading ? (
               Array.from({ length: Math.max(10, Math.ceil(items.length / 5) * 5) || 10 }).map((_, index) => (
                 <div
                   key={`loading-${index}`}
                   className="relative w-full h-full rounded-[18px] border border-white/10 overflow-hidden"
                   style={{
                     background: "rgba(255,255,255,0.02)",
                     boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                   }}
                 >
                   <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
                 </div>
               ))
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={rectSortingStrategy}
                >
                  {Array.from({ length: Math.max(10, Math.ceil(items.length / 5) * 5) }).map((_, index) => {
                    const b = items[index];
                    return (
                      <div
                        key={b?.id || `empty-${index}`}
                        className={`
                          relative
                          w-full
                          h-full
                          rounded-[18px]
                          border
                          ${index < 10 ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-white/10 bg-white/[0.02]"}
                          overflow-hidden
                        `}
                        style={{
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                        }}
                      >
                        {b ? (
                          <SortableItem button={b} />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
                            <span className="text-[8px] font-mono">
                              {index < 10 ? `slot ${index + 1}` : "empty"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </SortableContext>
              </DndContext>
            )}
            </div>

            <div className="w-14 flex flex-col gap-3 shrink-0">
              <button 
                onClick={scrollUp}
                className="flex-1 flex items-center justify-center rounded-[18px] border border-white/10 hover:bg-white/[0.05] active:bg-white/[0.1] transition-colors"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                <ChevronUp size={28} className="text-white/40" />
              </button>
              <button 
                onClick={scrollDown}
                className="flex-1 flex items-center justify-center rounded-[18px] border border-white/10 hover:bg-white/[0.05] active:bg-white/[0.1] transition-colors"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                <ChevronDown size={28} className="text-white/40" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
