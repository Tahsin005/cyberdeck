import { useState, useEffect } from "react";

export function useLandscapeMode() {
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

  return { landscape, ready, toggleRotation };
}
