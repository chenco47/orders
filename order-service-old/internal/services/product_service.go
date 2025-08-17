package services

import (
	"fmt"
	"log"
	"strings"

	"shufersal-order-service/internal/models"
)

// ProductService handles product catalog operations
type ProductService struct {
	products []models.Product
}

// NewProductService creates a new product service
func NewProductService() *ProductService {
	service := &ProductService{}
	service.products = service.getSampleProducts()
	log.Printf("Loaded %d products", len(service.products))
	return service
}

// GetAllProducts returns all products in the catalog
func (ps *ProductService) GetAllProducts() []models.Product {
	return ps.products
}

// FindBestMatch finds the best matching product for a search term
func (ps *ProductService) FindBestMatch(searchTerm string) (*models.ProductMatch, error) {
	if len(ps.products) == 0 {
		return nil, fmt.Errorf("no products loaded")
	}

	normalizedSearch := ps.normalizeHebrew(searchTerm)
	bestMatch := &models.ProductMatch{
		Confidence: 0.0,
		MatchType:  "none",
	}

	for _, product := range ps.products {
		normalizedName := ps.normalizeHebrew(product.Name)
		
		// Exact match
		if normalizedName == normalizedSearch {
			return &models.ProductMatch{
				Product:    product,
				Confidence: 1.0,
				MatchType:  "exact",
			}, nil
		}

		// Contains match
		if strings.Contains(normalizedName, normalizedSearch) || strings.Contains(normalizedSearch, normalizedName) {
			confidence := ps.calculateConfidence(normalizedSearch, normalizedName)
			if confidence > bestMatch.Confidence {
				bestMatch = &models.ProductMatch{
					Product:    product,
					Confidence: confidence,
					MatchType:  "partial",
				}
			}
		}
	}

	if bestMatch.Confidence > 0.5 {
		return bestMatch, nil
	}

	return nil, fmt.Errorf("no matching product found for: %s", searchTerm)
}

// FuzzySearch returns multiple potential matches
func (ps *ProductService) FuzzySearch(searchTerm string, threshold float64) []models.ProductMatch {
	normalizedSearch := ps.normalizeHebrew(searchTerm)
	var matches []models.ProductMatch

	for _, product := range ps.products {
		normalizedName := ps.normalizeHebrew(product.Name)
		
		confidence := ps.stringSimilarity(normalizedSearch, normalizedName)
		if confidence >= threshold {
			matches = append(matches, models.ProductMatch{
				Product:    product,
				Confidence: confidence,
				MatchType:  ps.getMatchType(confidence),
			})
		}
	}

	return matches
}

// normalizeHebrew normalizes Hebrew text for comparison
func (ps *ProductService) normalizeHebrew(text string) string {
	// Convert to lowercase and trim spaces
	normalized := strings.ToLower(strings.TrimSpace(text))
	
	// Remove common Hebrew prefixes/suffixes variations
	normalized = strings.ReplaceAll(normalized, "ה", "") // Remove definite article
	
	return normalized
}

// stringSimilarity calculates similarity between two strings
func (ps *ProductService) stringSimilarity(s1, s2 string) float64 {
	if s1 == s2 {
		return 1.0
	}
	
	// Simple similarity based on common characters
	commonChars := 0
	maxLen := len(s1)
	if len(s2) > maxLen {
		maxLen = len(s2)
	}
	
	for i := 0; i < len(s1) && i < len(s2); i++ {
		if s1[i] == s2[i] {
			commonChars++
		}
	}
	
	return float64(commonChars) / float64(maxLen)
}

// calculateConfidence calculates confidence score for partial matches
func (ps *ProductService) calculateConfidence(search, name string) float64 {
	if len(search) == 0 || len(name) == 0 {
		return 0.0
	}
	
	// Higher confidence for longer matches
	matchLength := len(search)
	if len(name) < matchLength {
		matchLength = len(name)
	}
	
	return float64(matchLength) / float64(len(name)) * 0.8
}

// getMatchType determines match type based on confidence
func (ps *ProductService) getMatchType(confidence float64) string {
	if confidence >= 0.95 {
		return "exact"
	} else if confidence >= 0.7 {
		return "fuzzy"
	}
	return "partial"
}

// getSampleProducts returns sample products
func (ps *ProductService) getSampleProducts() []models.Product {
	return []models.Product{
		{
			ID:          "tomato-001",
			Name:        "עגבניות",
			Category:    "vegetables",
			Price:       12.90,
			Unit:        "קילו",
			InStock:     true,
			Description: "עגבניות טריות",
		},
		{
			ID:          "cucumber-001",
			Name:        "מלפפונים",
			Category:    "vegetables",
			Price:       4.50,
			Unit:        "יחידה",
			InStock:     true,
			Description: "מלפפונים טריים",
		},
		{
			ID:          "banana-001",
			Name:        "בננות",
			Category:    "fruits",
			Price:       8.90,
			Unit:        "קילו",
			InStock:     true,
			Description: "בננות מתוקות",
		},
		{
			ID:          "apple-001",
			Name:        "תפוחים אדומים",
			Category:    "fruits",
			Price:       14.90,
			Unit:        "קילו",
			InStock:     true,
			Description: "תפוחים אדומים טריים",
		},
		{
			ID:          "carrot-001",
			Name:        "גזר",
			Category:    "vegetables",
			Price:       6.90,
			Unit:        "קילו",
			InStock:     true,
			Description: "גזר טרי",
		},
		{
			ID:          "milk-001",
			Name:        "חלב 3%",
			Category:    "dairy",
			Price:       5.90,
			Unit:        "ליטר",
			InStock:     true,
			Description: "חלב 3% שומן",
		},
	}
}
