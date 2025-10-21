import express from 'express';
import { databaseService } from '../services/databaseService.js';

export const router = express.Router();

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await databaseService.getAllOrders();
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

// Get order by ID
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await databaseService.getOrder(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      message: error.message
    });
  }
});

// Create new order
router.post('/orders', async (req, res) => {
  try {
    const { customer_name, customer_phone, address, latitude, longitude, description } = req.body;
    
    // Validate required fields
    if (!customer_name || !customer_phone || !address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customer_name, customer_phone, address'
      });
    }
    
    const orderData = {
      customer_name,
      customer_phone,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      description: description || '',
      status: 'pending'
    };
    
    const orderId = await databaseService.createOrder(orderData);
    
    res.status(201).json({
      success: true,
      data: { id: orderId },
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message
    });
  }
});

// Assign master to order
router.post('/orders/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { master_id } = req.body;
    
    if (!master_id) {
      return res.status(400).json({
        success: false,
        error: 'master_id is required'
      });
    }
    
    await databaseService.assignMaster(id, master_id);
    
    res.json({
      success: true,
      message: 'Master assigned successfully'
    });
  } catch (error) {
    console.error('Error assigning master:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign master',
      message: error.message
    });
  }
});

// Get all masters
router.get('/masters', async (req, res) => {
  try {
    const masters = await databaseService.getAllMasters();
    res.json({
      success: true,
      data: masters,
      count: masters.length
    });
  } catch (error) {
    console.error('Error fetching masters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch masters',
      message: error.message
    });
  }
});

export default router;
