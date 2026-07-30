package main

import (
	"flag"
	"log"
	"net/http"
	"strconv"

	"github.com/Tahsin005/cyberdeck/server/internal/api"
	"github.com/Tahsin005/cyberdeck/server/internal/config"
)

func main() {
	port := flag.Int("port", 8888, "port to listen on")
	flag.Parse()

	if err := config.LoadConfig(); err != nil {
		log.Fatal("failed to load config.json:", err)
	}

	mux := http.NewServeMux()
	api.RegisterHandlers(mux)

	addr := ":" + strconv.Itoa(*port)
	log.Println("cyberdeck server listening on", addr)
	log.Fatal(http.ListenAndServe(addr, api.CorsMiddleware(mux)))
}
