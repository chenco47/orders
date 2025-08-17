package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"shufersal-order-service/internal/models"
	"shufersal-order-service/internal/services"
)

// OrderHandler handles order-related HTTP requests
type OrderHandler struct {
	orderService *services.OrderService
}

// NewOrderHandler creates a new order handler
func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
	}
}

// AnalyzeOrder analyzes text and builds an order
func (oh *OrderHandler) AnalyzeOrder(c *gin.Context) {
	var request models.OrderRequest
	
	// Bind JSON request
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.OrderResponse{
			Success: false,
			Error:   "Invalid request format: " + err.Error(),
		})
		return
	}

	// Validate request
	if request.Text == "" {
		c.JSON(http.StatusBadRequest, models.OrderResponse{
			Success: false,
			Error:   "Text field is required",
		})
		return
	}

	// Process the order
	response, err := oh.orderService.AnalyzeAndBuildOrder(c.Request.Context(), request.Text)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.OrderResponse{
			Success: false,
			Error:   "Internal server error: " + err.Error(),
		})
		return
	}

	// Return successful response
	if response.Success {
		c.JSON(http.StatusOK, response)
	} else {
		c.JSON(http.StatusUnprocessableEntity, response)
	}
}
