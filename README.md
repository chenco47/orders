# 🛒 Shufersal Online - E-commerce Platform

Modern e-commerce platform for Shufersal with AI-powered voice ordering, Hebrew RTL support, and comprehensive order management.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Go** 1.21+
- **OpenAI API Key** (for AI features)

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/chenco47/orders.git
cd orders

# Install frontend dependencies
npm install
```

### 2. Backend Setup (Go Order Service)

```bash
# Navigate to order service
cd order-service

# Install Go dependencies
go mod tidy

# Create environment file
cp .env.example .env
# Edit .env with your OpenAI API key
```

**Create `order-service/.env`:**
```env
PORT=8080
HOST=0.0.0.0
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
ENVIRONMENT=development
LOG_LEVEL=info
```

### 3. Run Both Services

**Terminal 1 - Backend (Go Service):**
```bash
cd order-service
go run ./cmd/main.go
```
*Backend will run on http://localhost:8080*

**Terminal 2 - Frontend (Next.js):**
```bash
# From project root
npm run dev
```
*Frontend will run on http://localhost:3000*

## 📁 Project Structure

```
├── src/                          # Frontend source code
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   ├── checkout/             # Checkout flow pages
│   │   └── category/             # Category pages
│   ├── components/               # React components
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Checkout components
│   │   ├── header/               # Navigation
│   │   ├── magic/                # AI voice component
│   │   ├── product/              # Product display
│   │   └── ui/                   # UI components
│   ├── data/                     # JSON data files
│   ├── store/                    # Zustand state management
│   └── types/                    # TypeScript types
├── order-service/                # Backend Go service
│   ├── cmd/                      # Application entry point
│   ├── internal/                 # Internal packages
│   │   ├── config/               # Configuration
│   │   ├── handlers/             # HTTP handlers
│   │   ├── middleware/           # HTTP middleware
│   │   ├── models/               # Data models
│   │   └── services/             # Business logic
│   └── README.md                 # Backend documentation
└── public/                       # Static assets
    └── images/                   # Product images
```

## 🎯 Features

### Frontend
- **🛒 Shopping Cart**: Add, remove, and manage products
- **🔍 Product Catalog**: Browse by categories with search
- **🎤 AI Voice Ordering**: Speak your order in Hebrew/English
- **💳 Checkout Flow**: Multi-step checkout with address and payment
- **🌐 RTL Support**: Full Hebrew right-to-left layout
- **📱 Responsive Design**: Works on all devices

### Backend
- **🤖 AI Order Analysis**: Hebrew NLP with OpenAI integration
- **📦 Product Management**: Product catalog and inventory
- **🛒 Order Processing**: Order creation and management
- **🏥 Health Monitoring**: Health check endpoints
- **🔒 CORS Support**: Ready for frontend integration

## 🔧 API Endpoints

### POST `/api/analyze-order`
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

### GET `/health`
Health check endpoint for monitoring.

## 🛠️ Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd order-service

# Development
go run ./cmd/main.go

# Build
go build -o bin/order-service ./cmd/main.go

# Run binary
./bin/order-service

# Tests
go test ./...
```

## 🐳 Docker Support

### Backend Docker
```bash
cd order-service

# Build image
docker build -t shufersal-order-service .

# Run container
docker run -p 8080:8080 --env-file .env shufersal-order-service
```

## 🔧 Troubleshooting

### Common Issues

1. **Go build fails**: Make sure you're in the `order-service` directory
   ```bash
   cd order-service
   go build -o bin/order-service ./cmd/main.go
   ```

2. **Frontend won't start**: Install dependencies
   ```bash
   npm install
   ```

3. **AI features not working**: Check your OpenAI API key in `order-service/.env`

4. **CORS errors**: Make sure backend is running on port 8080

### Port Configuration
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **API Base URL**: http://localhost:8080/api

## 🌟 Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Go 1.21+, OpenAI GPT API
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS with RTL support
- **Icons**: Lucide React

## 📱 Mobile Support

The application is fully responsive and optimized for:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Adaptive layout with touch-friendly interface  
- **Mobile**: Optimized for thumb navigation and mobile checkout

## 🌐 Internationalization

- **Hebrew**: Full RTL support with proper text direction
- **English**: LTR layout support
- **Mixed Content**: Handles Hebrew-English mixed content properly

## 📈 Performance

- **SSR**: Server-side rendering with Next.js
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components and routes loaded on demand

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Happy Shopping! 🛒✨**
