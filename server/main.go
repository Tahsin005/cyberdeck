// server/main.go
package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"sync"
)

type Button struct {
	ID    string   `json:"id"`
	Label string   `json:"label"`
	Icon  string   `json:"icon"`
	Color string   `json:"color"`
	Cmd   string   `json:"cmd"`
	Args  []string `json:"args"`
}

type Config struct {
	Buttons []Button `json:"buttons"`
}

var (
	config    Config
	actionMap map[string]Button
	mu        sync.RWMutex
)

func loadConfig() error {
	data, err := os.ReadFile("config.json")
	if err != nil {
		return err
	}
	var c Config
	if err := json.Unmarshal(data, &c); err != nil {
		return err
	}

	m := make(map[string]Button, len(c.Buttons))
	for _, b := range c.Buttons {
		m[b.ID] = b
	}

	mu.Lock()
	config = c
	actionMap = m
	mu.Unlock()
	return nil
}

func corsMiddleware(next http.Handler) http.Handler {
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
	mu.RLock()
	defer mu.RUnlock()
	json.NewEncoder(w).Encode(config)
}

func actionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	name := r.PathValue("name")

	mu.RLock()
	b, ok := actionMap[name]
	mu.RUnlock()
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
	if err := loadConfig(); err != nil {
		http.Error(w, "reload failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "reloaded"})
}

func main() {
	port := flag.Int("port", 8888, "port to listen on")
	flag.Parse()

	if err := loadConfig(); err != nil {
		log.Fatal("failed to load config.json:", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /config", configHandler)
	mux.HandleFunc("POST /action/{name}", actionHandler)
	mux.HandleFunc("POST /reload", reloadHandler)

	addr := ":" + strconv.Itoa(*port)
	log.Println("cyberdeck server listening on", addr)
	log.Fatal(http.ListenAndServe(addr, corsMiddleware(mux)))
}