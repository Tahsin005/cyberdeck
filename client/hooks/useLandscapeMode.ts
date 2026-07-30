import { useState, useEffect } from "react";

export function useLandscapeMode() {
  const [flipped, setFlipped] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cyberdeck-flipped") === "1";
    }
    return false;
  });

  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  function toggleRotation() {
    setFlipped((prev) => {
      const next = !prev;
      localStorage.setItem("cyberdeck-flipped", next ? "1" : "0");
      return next;
    });
  }

  return { flipped, ready, toggleRotation };
}
