import { useState, useEffect } from "react";
import { ButtonConfig } from "../types";

const SERVER = "http://localhost:8888";

export function useCyberdeckConfig() {
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);
  const [status, setStatus] = useState("");
  const [pressed, setPressed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  return { buttons, status, pressed, loading, loadConfig, fire };
}
