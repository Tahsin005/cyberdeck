package models

// Button represents a single macro button configuration.
type Button struct {
	ID    string   `json:"id"`
	Label string   `json:"label"`
	Icon  string   `json:"icon"`
	Color string   `json:"color"`
	Cmd   string   `json:"cmd"`
	Args  []string `json:"args"`
}
