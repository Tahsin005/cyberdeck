# Cyberdeck

Turn an idle Android phone into a physical-style macro deck for a Linux
(Omarchy/Hyprland) desktop — a self-hosted Stream Deck. The phone shows a
grid of buttons over USB; tapping one runs a shell command on the laptop.

```
┌─────────────┐        USB (adb reverse)        ┌───────────────────┐
│   Android    │ ───────────────────────────────▶ │   Laptop (Linux)   │
│  phone (PWA) │  HTTP  :3333 (UI)  :8888 (API)   │  Next.js + Go      │
└─────────────┘ ◀─────────────────────────────── └───────────────────┘
                                                          │
                                                          ▼
                                            grim / slurp / gtk-launch / …
```

No Wi-Fi, no auth, no cloud — the API is only reachable through the USB
tunnel, so there's nothing exposed to the network.

## How it works

- **`server/`** — a Go server (stdlib only) that reads `config.json`,
  exposes the button list over HTTP, and executes the matching shell
  command when a button is pressed.
- **`client/`** — a Next.js page that fetches the button list from the
  server and renders it as a deck of keys. Installable as a PWA on the
  phone (Add to Home Screen) for an app-like feel.
- **`adb reverse`** tunnels the phone's `localhost:3333`/`:8888` straight
  to the laptop's — no IP discovery, works over the same cable used to
  charge the phone.

## Requirements

- Go (1.22+, for the `net/http` method/wildcard routing used in `cmd/server/main.go`)
- Node.js + npm
- `adb` (`android-tools` on Arch), with **USB debugging** enabled on the
  phone and the device authorized (`adb devices` should show it as
  `device`, not `unauthorized`)

## Project layout

```
cyberdeck/
├── client/                  # Next.js frontend
│   └── app/page.tsx
├── server/                  # Go backend
│   ├── cmd/server/main.go
│   ├── internal/            # models, config, api handlers
│   └── config.json          # ← button definitions live here
├── logs/                    # created at runtime by the start script
├── .pids/                   # created at runtime by the start script
└── (start/stop script lives outside the repo, see below)
```

The control script lives at `~/.config/waybar/scripts/cyberdeck.sh` (not
inside this repo) so it can be wired into waybar independently of where
the source is checked out.

## Ports

| Service         | Port | Purpose                          |
|------------------|------|-----------------------------------|
| Client (Next.js) | 3333 | Serves the button UI              |
| Server (Go)      | 8888 | `/config`, `/action/{id}`, `/reload` |

## Quick start

```bash
# one-time: authorize the phone
adb devices        # should list your device as "device"

# start both services + adb reverse
~/.config/waybar/scripts/cyberdeck.sh start

# check status / stop
~/.config/waybar/scripts/cyberdeck.sh status
~/.config/waybar/scripts/cyberdeck.sh stop
```

Then on the phone, open `http://localhost:3333` in Chrome and
**Add to Home Screen**.

## Adding a new button

Everything is config-driven — no code changes needed. Edit
`server/config.json`:

```json
{
  "id": "lock_screen",
  "label": "Lock",
  "icon": "Lock",
  "color": "#f59e0b",
  "cmd": "hyprlock",
  "args": []
}
```

- `id` — unique, used as the `/action/:id` route
- `icon` — any [lucide-react](https://lucide.dev/icons) icon name
- `color` — hex, used for the icon
- `cmd` / `args` — passed straight to `exec.Command`, same as running it
  in a terminal

Then reload without restarting anything:

```bash
curl -X POST http://localhost:8888/reload   # server re-reads config.json
```

and tap **↻ reload** in the UI to refresh the button list.

## API

| Method | Route            | Description                          |
|--------|------------------|----------------------------------------|
| GET    | `/config`        | Returns the full button list as JSON   |
| POST   | `/action/{id}`   | Runs the command for that button id    |
| POST   | `/reload`        | Re-reads `config.json` from disk       |

## Notes & gotchas

- **Environment inheritance**: the Go server must be started from
  *inside* the Hyprland graphical session (which the control script does
  via a plain background process, not a systemd unit) — Wayland tools
  like `grim`/`slurp` need `WAYLAND_DISPLAY`, `XDG_RUNTIME_DIR`, etc. from
  that session. If this ever moves to a systemd `--user` service, those
  variables need to be imported explicitly.
- **`gtk-launch`** takes a desktop-entry *name*, not a path — e.g. for
  `~/.local/share/applications/WhatsApp.desktop`, the argument is just
  `WhatsApp`.
- **Stopping `go run`**: the control script kills the whole process
  group on `stop`, since `go run` execs a child binary and killing only
  the wrapper pid can leave the real server process (and the port)
  orphaned.
