package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os/exec"

	"github.com/Tahsin005/cyberdeck/server/internal/config"
)

// RegisterHandlers maps the HTTP routes to their respective handlers.
func RegisterHandlers(mux *http.ServeMux) {
	mux.HandleFunc("GET /config", configHandler)
	mux.HandleFunc("POST /action/{name}", actionHandler)
	mux.HandleFunc("POST /reload", reloadHandler)
}

// CorsMiddleware adds headers to allow cross-origin requests.
func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func configHandler(w http.ResponseWriter, r *http.Request) {
	c := config.GetConfig()
	json.NewEncoder(w).Encode(c)
}

func actionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	name := r.PathValue("name")

	b, ok := config.GetButton(name)
	if !ok {
		http.Error(w, "unknown action", http.StatusNotFound)
		return
	}

	cmd := exec.Command(b.Cmd, b.Args...)
	if err := cmd.Start(); err != nil {
		log.Println("action failed:", name, err)
		http.Error(w, "action failed", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "action": name})
}

func reloadHandler(w http.ResponseWriter, r *http.Request) {
	if err := config.LoadConfig(); err != nil {
		http.Error(w, "reload failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "reloaded"})
}
