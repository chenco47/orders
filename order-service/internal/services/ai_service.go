package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"shufersal-order-service/internal/models"

	"github.com/sashabaranov/go-openai"
)

// AIService handles OpenAI integration
type AIService struct {
	client *openai.Client
	model  string
}

// NewAIService creates a new AI service
func NewAIService(apiKey, model string) *AIService {
	return &AIService{
		client: openai.NewClient(apiKey),
		model:  model,
	}
}

// AnalyzeOrderText analyzes the user text and extracts order information
func (ai *AIService) AnalyzeOrderText(ctx context.Context, text string, products []models.Product) (*models.OrderAnalysis, error) {
	log.Printf("Received %d products for AI analysis", len(products))
	for i, product := range products {
		log.Printf("Product %d: %s (ID: %s)", i+1, product.Name, product.ID)
	}

	// Build the system prompt with product catalog
	systemPrompt := ai.buildSystemPrompt(products)
	log.Printf("System prompt length: %d characters", len(systemPrompt))

	// Create the conversation
	messages := []openai.ChatCompletionMessage{
		{
			Role:    openai.ChatMessageRoleSystem,
			Content: systemPrompt,
		},
		{
			Role:    openai.ChatMessageRoleUser,
			Content: fmt.Sprintf("Customer request: %s", text),
		},
	}

	// Call OpenAI API
	resp, err := ai.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model:       ai.model,
		Messages:    messages,
		MaxTokens:   1000,
		Temperature: 0.3, // Lower temperature for more consistent results
	})

	if err != nil {
		log.Printf("OpenAI API error: %v", err)
		return nil, fmt.Errorf("failed to analyze text with AI: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from AI")
	}

	// Parse the AI response
	aiResponse := resp.Choices[0].Message.Content
	log.Printf("AI Response: %s", aiResponse)

	analysis, err := ai.parseAIResponse(aiResponse)
	if err != nil {
		return nil, err
	}

	// Fallback manual parsing if AI missed products
	analysis = ai.addFallbackParsing(text, products, analysis)

	return analysis, nil
}

// buildSystemPrompt creates the system prompt with product catalog
func (ai *AIService) buildSystemPrompt(products []models.Product) string {
	productList := ""
	for _, product := range products {
		productList += fmt.Sprintf("- %s (ID: %s, Price: %.2f ₪, Unit: %s)\n",
			product.Name, product.ID, product.Price, product.Unit)
	}

	log.Printf("Product list for AI:\n%s", productList)

	systemPrompt := fmt.Sprintf(`You are a Hebrew shopping assistant. Extract products from Hebrew text.

PRODUCTS IN STORE:
%s

RULES:
1. Look for these EXACT product names in the text: עגבניות, גזר, מלפפונים, בננות, תפוחים אדומים, חלב 3%%
2. If text contains "עגבניות וגזר" - return BOTH "עגבניות" AND "גזר" as separate items
3. Split on "ו" (and) to find multiple products
4. Default quantity is 1 if not specified
5. Use catalog units if not specified

Return JSON format:
{
  "items": [
    {"product_name": "exact name from catalog", "quantity": 1, "unit": "catalog unit", "confidence": 0.95}
  ],
  "unrecognized": [],
  "confidence": 0.95
}

EXAMPLE:
Input: "עגבניות וגזר"
Output: {"items": [{"product_name": "עגבניות", "quantity": 1, "unit": "קילו", "confidence": 0.95}, {"product_name": "גזר", "quantity": 1, "unit": "קילו", "confidence": 0.95}], "unrecognized": [], "confidence": 0.95}`, productList)

	log.Printf("Full system prompt being sent to AI:\n%s", systemPrompt)
	return systemPrompt
}

// parseAIResponse parses the JSON response from OpenAI
func (ai *AIService) parseAIResponse(response string) (*models.OrderAnalysis, error) {
	var analysis models.OrderAnalysis

	// Try to parse the JSON response
	if err := json.Unmarshal([]byte(response), &analysis); err != nil {
		log.Printf("Failed to parse AI response as JSON: %v", err)
		log.Printf("Raw response: %s", response)

		// Fallback: try to extract basic info using string parsing
		return ai.fallbackParsing(response)
	}

	// Validate the response
	if len(analysis.Items) == 0 {
		return &models.OrderAnalysis{
			Items:            []models.AnalyzedItem{},
			UnrecognizedText: []string{response},
			Confidence:       0.0,
		}, nil
	}

	// Set overall confidence if not provided
	if analysis.Confidence == 0.0 {
		totalConfidence := 0.0
		for _, item := range analysis.Items {
			totalConfidence += item.Confidence
		}
		analysis.Confidence = totalConfidence / float64(len(analysis.Items))
	}

	return &analysis, nil
}

// addFallbackParsing manually checks for products that AI might have missed
func (ai *AIService) addFallbackParsing(text string, products []models.Product, analysis *models.OrderAnalysis) *models.OrderAnalysis {
	// Known Hebrew product names to manually check
	hebrewProducts := map[string]string{
		"עגבניות":  "עגבניות",
		"גזר":      "גזר",
		"מלפפונים": "מלפפונים",
		"בננות":    "בננות",
		"תפוחים":   "תפוחים אדומים",
		"חלב":      "חלב 3%",
	}

	// Check if any products were missed
	for hebrewName, catalogName := range hebrewProducts {
		// Check if this product appears in the text but wasn't found by AI
		if strings.Contains(text, hebrewName) {
			// Check if it's already in the analysis
			found := false
			for _, item := range analysis.Items {
				if item.ProductName == catalogName {
					found = true
					break
				}
			}

			// If not found, try to find it in the catalog and add it
			if !found {
				for _, product := range products {
					if product.Name == catalogName {
						analysis.Items = append(analysis.Items, models.AnalyzedItem{
							ProductName: catalogName,
							Quantity:    1,
							Unit:        product.Unit,
							Confidence:  0.8, // Lower confidence for manual parsing
						})
						log.Printf("Fallback parser added: %s", catalogName)
						break
					}
				}
			}
		}
	}

	return analysis
}

// fallbackParsing provides basic parsing when JSON parsing fails
func (ai *AIService) fallbackParsing(response string) (*models.OrderAnalysis, error) {
	log.Printf("Using fallback parsing for response: %s", response)

	return &models.OrderAnalysis{
		Items:            []models.AnalyzedItem{},
		UnrecognizedText: []string{response},
		Confidence:       0.1,
	}, nil
}
