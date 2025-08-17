# Shufersal Order Service

AI-powered order analysis service for Shufersal Online.

## Features

- **Hebrew NLP**: Analyzes Hebrew text for grocery shopping requests
- **OpenAI Integration**: Uses GPT for intelligent product recognition
- **Product Matching**: Fuzzy matching against Shufersal product catalog
- **RESTful API**: Simple HTTP endpoints for order analysis
- **CORS Support**: Ready for frontend integration

## Setup

### Prerequisites

- Go 1.21+
- OpenAI API key

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8080
HOST=0.0.0.0
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
ENVIRONMENT=development
LOG_LEVEL=info
```

### Installation

```bash
# Install dependencies
go mod tidy

# Build the service
go build -o bin/order-service ./cmd/main.go

# Run the service
./bin/order-service
```

## API Endpoints

### POST /api/analyze-order

Analyzes text and builds an order from it.

**Request:**
```json
{
  "text": "אני רוצה לקנות 2 קילו עגבניות ו3 מלפפונים"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "items": [
      {
        "product_id": "tomato-001",
        "name": "עגבניות",
        "quantity": 2,
        "unit": "קילו",
        "price_per_unit": 12.90,
        "total_price": 25.80,
        "confidence": 0.95
      }
    ],
    "total_amount": 25.80,
    "currency": "ILS"
  }
}
```

### GET /health

Health check endpoint.

## Development

```bash
# Run in development mode
go run ./cmd/main.go

# Run tests
go test ./...
```

## Docker

```bash
# Build Docker image
docker build -t shufersal-order-service .

# Run container
docker run -p 8080:8080 --env-file .env shufersal-order-service
``` 