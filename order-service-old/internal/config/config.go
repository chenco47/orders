package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all configuration for our application
type Config struct {
	Server struct {
		Port string
		Host string
	}
	OpenAI struct {
		APIKey string
		Model  string
	}
	App struct {
		Environment string
		LogLevel    string
	}
}

// Load loads configuration from environment variables
func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	config := &Config{}

	// Server configuration
	config.Server.Port = getEnv("PORT", "8080")
	config.Server.Host = getEnv("HOST", "0.0.0.0")

	// OpenAI configuration
	config.OpenAI.APIKey = getEnv("OPENAI_API_KEY", "")
	if config.OpenAI.APIKey == "" {
		log.Fatal("OPENAI_API_KEY environment variable is required")
	}
	config.OpenAI.Model = getEnv("OPENAI_MODEL", "gpt-3.5-turbo")

	// App configuration
	config.App.Environment = getEnv("ENVIRONMENT", "development")
	config.App.LogLevel = getEnv("LOG_LEVEL", "info")

	return config
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
