#!/bin/bash

# Nexa Order Flow MVP API Test Script
echo "🧪 Testing Nexa Order Flow MVP API..."

API_BASE="http://localhost:3001"

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$API_BASE/api/health" | jq '.' || echo "Health check failed"

echo ""

# Test API info endpoint
echo "2. Testing API info endpoint..."
curl -s "$API_BASE/api" | jq '.' || echo "API info failed"

echo ""

# Test creating an order
echo "3. Creating a new order..."
ORDER_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "address": "123 Main St, New York, NY",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "description": "Kitchen repair needed"
  }')

echo "$ORDER_RESPONSE" | jq '.'

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.order.id')
echo "Created order ID: $ORDER_ID"

echo ""

# Test getting masters
echo "4. Getting available masters..."
curl -s "$API_BASE/api/v1/masters" | jq '.'

echo ""

# Test assigning master
echo "5. Assigning master to order..."
ASSIGN_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/orders/$ORDER_ID/assign" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "maxDistance": 50
  }')

echo "$ASSIGN_RESPONSE" | jq '.'

echo ""

# Test getting order details
echo "6. Getting order details..."
curl -s "$API_BASE/api/v1/orders/$ORDER_ID" | jq '.'

echo ""

# Test uploading ADL (this will fail without a real file, but shows the endpoint)
echo "7. Testing ADL upload endpoint (will fail without file)..."
curl -s -X POST "$API_BASE/api/v1/orders/$ORDER_ID/adl" \
  -F "file=@nonexistent.jpg" || echo "ADL upload failed as expected (no file provided)"

echo ""

# Test completing order (will fail without ADL)
echo "8. Testing order completion (will fail without ADL)..."
curl -s -X POST "$API_BASE/api/v1/orders/$ORDER_ID/complete" | jq '.' || echo "Order completion failed as expected (no ADL uploaded)"

echo ""

echo "✅ API test completed!"
echo ""
echo "To test the full flow with file upload:"
echo "1. Take a photo with GPS enabled"
echo "2. Use the React UI at http://localhost:3000"
echo "3. Or use curl with a real file:"
echo "   curl -X POST $API_BASE/api/v1/orders/$ORDER_ID/adl -F \"file=@your-photo.jpg\""
