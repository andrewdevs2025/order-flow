import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { databaseService } from '../services/databaseService.js';
import { extractGPSMetadata, validateFile } from '../services/gpsService.js';

export const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/adl';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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

// Assign master to order (automatic)
router.post('/orders/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { maxDistance = 50 } = req.body;

    const bestMaster = await databaseService.findAndAssignBestMaster(id, maxDistance);

    if (!bestMaster) {
      return res.status(404).json({
        success: false,
        error: 'No suitable master found within the specified distance'
      });
    }

    res.json({
      success: true,
      data: bestMaster,
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

// Upload ADL (photo/video with GPS)
router.post('/orders/:id/adl', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Validate file
    validateFile(req.file);

    // Extract GPS metadata
    const fileBuffer = fs.readFileSync(req.file.path);
    const gpsData = await extractGPSMetadata(fileBuffer, req.file.mimetype);

    // Determine file type
    const fileType = req.file.mimetype.startsWith('image/') ? 'photo' : 'video';

    // Save ADL attachment to database
    const attachmentData = {
      order_id: id,
      file_path: req.file.path,
      file_type: fileType,
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      timestamp: gpsData.timestamp
    };

    const attachmentId = await databaseService.addADLAttachment(attachmentData);

    res.json({
      success: true,
      data: {
        id: attachmentId,
        fileType: fileType,
        gpsData: gpsData
      },
      message: 'ADL uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading ADL:', error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload ADL',
      message: error.message
    });
  }
});

// Complete order
router.post('/orders/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    await databaseService.completeOrder(id);

    res.json({
      success: true,
      message: 'Order completed successfully'
    });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete order',
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
