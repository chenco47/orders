package models

import "time"

// OrderRequest represents the incoming request to analyze order text
type OrderRequest struct {
	Text      string `json:"text" binding:"required"`
	SessionID string `json:"session_id,omitempty"`
}

// OrderItem represents a single item in an order
type OrderItem struct {
	ProductID    string  `json:"product_id"`
	Name         string  `json:"name"`
	Quantity     float64 `json:"quantity"`
	Unit         string  `json:"unit"`
	PricePerUnit float64 `json:"price_per_unit"`
	TotalPrice   float64 `json:"total_price"`
	Confidence   float64 `json:"confidence"`
}

// Order represents a complete order
type Order struct {
	Items       []OrderItem `json:"items"`
	TotalAmount float64     `json:"total_amount"`
	Currency    string      `json:"currency"`
	CreatedAt   time.Time   `json:"created_at"`
}

// AmbiguousItem represents an item that couldn't be clearly identified
type AmbiguousItem struct {
	Text        string   `json:"text"`
	Suggestions []string `json:"suggestions"`
}

// OrderResponse represents the response from order analysis
type OrderResponse struct {
	Success         bool            `json:"success"`
	Order           *Order          `json:"order,omitempty"`
	AmbiguousItems  []AmbiguousItem `json:"ambiguous_items,omitempty"`
	UnrecognizedText []string       `json:"unrecognized_text,omitempty"`
	Message         string          `json:"message,omitempty"`
	Error           string          `json:"error,omitempty"`
}

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
