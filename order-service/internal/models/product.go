package models

// Product represents a product in the Shufersal catalog
type Product struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	Price       float64 `json:"price"`
	Image       string  `json:"image"`
	Description string  `json:"description"`
	Unit        string  `json:"unit"` // e.g., "קילו", "יחידה", "גרם"
	InStock     bool    `json:"in_stock"`
}

// ProductMatch represents a product match with confidence score
type ProductMatch struct {
	Product    Product `json:"product"`
	Confidence float64 `json:"confidence"`
	MatchType  string  `json:"match_type"` // "exact", "fuzzy", "partial"
}
