package config

import (
	"encoding/json"
	"os"
	"sync"

	"github.com/Tahsin005/cyberdeck/server/internal/models"
)

// ConfigData represents the entire configuration file format.
type ConfigData struct {
	Buttons []models.Button `json:"buttons"`
}

var (
	currentConfig ConfigData
	actionMap     map[string]models.Button
	mu            sync.RWMutex
)

// LoadConfig reads the config.json file and populates the in-memory state.
func LoadConfig() error {
	data, err := os.ReadFile("config.json")
	if err != nil {
		return err
	}
	var c ConfigData
	if err := json.Unmarshal(data, &c); err != nil {
		return err
	}

	m := make(map[string]models.Button, len(c.Buttons))
	for _, b := range c.Buttons {
		m[b.ID] = b
	}

	mu.Lock()
	currentConfig = c
	actionMap = m
	mu.Unlock()
	return nil
}

// GetConfig returns a thread-safe copy of the current configuration.
func GetConfig() ConfigData {
	mu.RLock()
	defer mu.RUnlock()
	return currentConfig
}

// GetButton returns the button configuration for a given ID, if it exists.
func GetButton(id string) (models.Button, bool) {
	mu.RLock()
	defer mu.RUnlock()
	b, ok := actionMap[id]
	return b, ok
}
