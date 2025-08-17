package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/sashabaranov/go-openai"
	"shufersal-order-service/internal/models"
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
	// Build the system prompt with product catalog
	systemPrompt := ai.buildSystemPrompt(products)
	
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
		Temperature: 0.3,
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

	return ai.parseAIResponse(aiResponse)
}

// buildSystemPrompt creates the system prompt with product catalog
func (ai *AIService) buildSystemPrompt(products []models.Product) string {
	productList := ""
	for _, product := range products {
		productList += fmt.Sprintf("- %s (ID: %s, Price: %.2f ₪, Unit: %s)\n", 
			product.Name, product.ID, product.Price, product.Unit)
	}

	return fmt.Sprintf(`You are a Hebrew grocery shopping assistant for Shufersal.
Your task is to analyze customer requests in Hebrew and extract:
1. Product names (match exactly with the provided catalog)
2. Quantities (numbers in Hebrew/Arabic numerals)
3. Units (קילו, גרם, יחידה, ליטר, etc.)

IMPORTANT RULES:
- Only return products that EXACTLY match names from the catalog
- Extract quantities as numbers (convert Hebrew numbers to digits)
- If units are not specified, use the default unit from the catalog
- Set confidence between 0.0-1.0 based on how certain you are
- Include unrecognized text that couldn't be parsed

Available products in catalog:
%s

Respond ONLY with valid JSON in this exact format:
{
  "items": [
    {
      "product_name": "exact name from catalog",
      "quantity": number,
      "unit": "string",
      "confidence": 0.95
    }
  ],
  "unrecognized": ["text that couldn't be parsed"],
  "confidence": 0.90
}

Examples:
- "אני רוצה 2 קילו עגבניות" → product_name: "עגבניות", quantity: 2, unit: "קילו"
- "תביא לי 3 מלפפונים" → product_name: "מלפפונים", quantity: 3, unit: "יחידה"
- "חלב אחד" → product_name: "חלב 3%%", quantity: 1, unit: "ליטר"`, productList)
}

// parseAIResponse parses the JSON response from OpenAI
func (ai *AIService) parseAIResponse(response string) (*models.OrderAnalysis, error) {
	var analysis models.OrderAnalysis
	
	// Try to parse the JSON response
	if err := json.Unmarshal([]byte(response), &analysis); err != nil {
		log.Printf("Failed to parse AI response as JSON: %v", err)
		log.Printf("Raw response: %s", response)
		
		// Fallback: return empty analysis
		return &models.OrderAnalysis{
			Items:            []models.AnalyzedItem{},
			UnrecognizedText: []string{response},
			Confidence:       0.1,
		}, nil
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
