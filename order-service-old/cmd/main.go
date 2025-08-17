package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"shufersal-order-service/internal/config"
	"shufersal-order-service/internal/handlers"
	"shufersal-order-service/internal/middleware"
	"shufersal-order-service/internal/services"
)

func main() {
	// Load configuration
	cfg := config.Load()
	log.Printf("Starting Shufersal Order Service on %s:%s", cfg.Server.Host, cfg.Server.Port)

	// Set Gin mode
	if cfg.App.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize services
	productService := services.NewProductService()
	aiService := services.NewAIService(cfg.OpenAI.APIKey, cfg.OpenAI.Model)
	orderService := services.NewOrderService(aiService, productService)

	// Initialize handlers
	orderHandler := handlers.NewOrderHandler(orderService)
	healthHandler := handlers.NewHealthHandler()

	// Setup router
	router := gin.New()

	// Add middleware
	router.Use(middleware.LoggingMiddleware())
	router.Use(middleware.CORSMiddleware())
	router.Use(gin.Recovery())

	// Setup routes
	setupRoutes(router, orderHandler, healthHandler)

	// Start server
	address := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	log.Printf("Server starting on %s", address)
	
	if err := router.Run(address); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// setupRoutes configures all the routes
func setupRoutes(router *gin.Engine, orderHandler *handlers.OrderHandler, healthHandler *handlers.HealthHandler) {
	// Health check
	router.GET("/health", healthHandler.Health)

	// API routes
	api := router.Group("/api")
	{
		api.POST("/analyze-order", orderHandler.AnalyzeOrder)
	}

	// Log all routes
	for _, route := range router.Routes() {
		log.Printf("Route registered: %s %s", route.Method, route.Path)
	}
}
