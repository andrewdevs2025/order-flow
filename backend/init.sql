-- Initialize PostgreSQL database for Nexa Order Flow
-- This file is automatically executed when the PostgreSQL container starts

-- Create the database if it doesn't exist (already handled by POSTGRES_DB env var)
-- CREATE DATABASE nexa_order_flow;

-- Connect to the database
\c nexa_order_flow;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create masters table
CREATE TABLE IF NOT EXISTS masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  active_orders INTEGER DEFAULT 0 CHECK (active_orders >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed')),
  master_id UUID REFERENCES masters(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create ADL attachments table
CREATE TABLE IF NOT EXISTS adl_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('photo', 'video')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_master_id ON orders(master_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_masters_rating ON masters(rating);
CREATE INDEX IF NOT EXISTS idx_masters_active_orders ON masters(active_orders);
CREATE INDEX IF NOT EXISTS idx_adl_attachments_order_id ON adl_attachments(order_id);

-- Insert sample masters
INSERT INTO masters (name, phone, latitude, longitude, rating, active_orders) VALUES
('John Smith', '+1234567890', 40.7128, -74.0060, 4.8, 0),
('Sarah Johnson', '+1234567891', 40.7589, -73.9851, 4.9, 0),
('Mike Wilson', '+1234567892', 40.7505, -73.9934, 4.7, 0),
('Lisa Brown', '+1234567893', 40.7614, -73.9776, 4.6, 0),
('David Lee', '+1234567894', 40.7282, -73.9942, 4.5, 0)
ON CONFLICT DO NOTHING;
