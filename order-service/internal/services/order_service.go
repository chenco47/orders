package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"shufersal-order-service/internal/models"
)

// OrderService orchestrates order creation from text analysis
type OrderService struct {
	aiService      *AIService
	productService *ProductService
}

// NewOrderService creates a new order service
func NewOrderService(aiService *AIService, productService *ProductService) *OrderService {
	return &OrderService{
		aiService:      aiService,
		productService: productService,
	}
}

// AnalyzeAndBuildOrder processes user text and builds an order
func (os *OrderService) AnalyzeAndBuildOrder(ctx context.Context, text string) (*models.OrderResponse, error) {
	log.Printf("Analyzing order text: %s", text)

	// Get all products for AI analysis
	products := os.productService.GetAllProducts()
	log.Printf("Retrieved %d products from product service", len(products))
	if len(products) == 0 {
		return &models.OrderResponse{
			Success: false,
			Error:   "No products available in catalog",
		}, nil
	}

	// Analyze text with AI
	analysis, err := os.aiService.AnalyzeOrderText(ctx, text, products)
	if err != nil {
		log.Printf("AI analysis failed: %v", err)
		return &models.OrderResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to analyze order: %v", err),
		}, nil
	}

	// If no items were identified, return early
	if len(analysis.Items) == 0 {
		return &models.OrderResponse{
			Success:          false,
			UnrecognizedText: analysis.UnrecognizedText,
			Message:          "No products could be identified from your request. Please try again with specific product names.",
		}, nil
	}

	// Build order from analysis
	order, ambiguousItems, unrecognized := os.buildOrderFromAnalysis(analysis)

	// Calculate total
	totalAmount := 0.0
	for _, item := range order.Items {
		totalAmount += item.TotalPrice
	}
	order.TotalAmount = totalAmount
	order.Currency = "ILS"
	order.CreatedAt = time.Now()

	response := &models.OrderResponse{
		Success:          true,
		Order:            order,
		AmbiguousItems:   ambiguousItems,
		UnrecognizedText: unrecognized,
	}

	if len(order.Items) == 0 {
		response.Success = false
		response.Message = "No valid products found. Please check product names and try again."
	}

	return response, nil
}

// buildOrderFromAnalysis converts AI analysis to order items
func (os *OrderService) buildOrderFromAnalysis(analysis *models.OrderAnalysis) (*models.Order, []models.AmbiguousItem, []string) {
	var orderItems []models.OrderItem
	var ambiguousItems []models.AmbiguousItem
	var unrecognized []string

	for _, analyzedItem := range analysis.Items {
		// Find matching product
		productMatch, err := os.productService.FindBestMatch(analyzedItem.ProductName)
		if err != nil {
			log.Printf("No match found for product: %s", analyzedItem.ProductName)

			// Try fuzzy search for suggestions
			suggestions := os.productService.FuzzySearch(analyzedItem.ProductName, 0.3)
			if len(suggestions) > 0 {
				var suggestionNames []string
				for _, suggestion := range suggestions {
					suggestionNames = append(suggestionNames, suggestion.Product.Name)
					if len(suggestionNames) >= 3 { // Limit to 3 suggestions
						break
					}
				}
				ambiguousItems = append(ambiguousItems, models.AmbiguousItem{
					Text:        analyzedItem.ProductName,
					Suggestions: suggestionNames,
				})
			} else {
				unrecognized = append(unrecognized, analyzedItem.ProductName)
			}
			continue
		}

		// Determine unit - use analyzed unit or product default
		unit := analyzedItem.Unit
		if unit == "" {
			unit = productMatch.Product.Unit
		}

		// Create order item
		pricePerUnit := productMatch.Product.Price
		totalPrice := pricePerUnit * analyzedItem.Quantity

		orderItem := models.OrderItem{
			ProductID:    productMatch.Product.ID,
			Name:         productMatch.Product.Name,
			Quantity:     analyzedItem.Quantity,
			Unit:         unit,
			PricePerUnit: pricePerUnit,
			TotalPrice:   totalPrice,
			Confidence:   analyzedItem.Confidence * productMatch.Confidence, // Combined confidence
		}

		orderItems = append(orderItems, orderItem)
		log.Printf("Added item: %s x%.1f %s = %.2f ₪",
			orderItem.Name, orderItem.Quantity, orderItem.Unit, orderItem.TotalPrice)
	}

	// Add any unrecognized text from AI analysis
	unrecognized = append(unrecognized, analysis.UnrecognizedText...)

	order := &models.Order{
		Items: orderItems,
	}

	return order, ambiguousItems, unrecognized
}
