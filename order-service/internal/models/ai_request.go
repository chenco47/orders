package models

// AnalyzedItem represents an item identified by AI
type AnalyzedItem struct {
	ProductName string  `json:"product_name"`
	Quantity    float64 `json:"quantity"`
	Unit        string  `json:"unit"`
	Confidence  float64 `json:"confidence"`
}

// OrderAnalysis represents the result of AI text analysis
type OrderAnalysis struct {
	Items            []AnalyzedItem `json:"items"`
	UnrecognizedText []string       `json:"unrecognized"`
	Confidence       float64        `json:"confidence"`
}

// AIPrompt represents the prompt structure for OpenAI
type AIPrompt struct {
	SystemMessage  string
	UserText       string
	ProductCatalog string
}
