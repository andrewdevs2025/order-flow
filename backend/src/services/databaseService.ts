import pkg from 'pg';
const { Pool } = pkg;
import { v4 as uuidv4 } from 'uuid';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  master_id?: string;
  created_at: string;
  assigned_at?: string;
  completed_at?: string;
}

export interface Master {
  id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  rating: number;
  active_orders: number;
  created_at: string;
}

export interface ADLAttachment {
  id: string;
  order_id: string;
  file_path: string;
  file_type: 'photo' | 'video';
  latitude: number;
  longitude: number;
  timestamp: string;
  created_at: string;
}

class DatabaseService {
  private pool: pkg.Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'nexa_order_flow',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Test connection
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      client.release();

      // Create tables
      await this.createTables();
      
      // Insert sample data
      await this.insertSampleMasters();
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Create masters table first (referenced by orders)
      await client.query(`
        CREATE TABLE IF NOT EXISTS masters (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          rating DECIMAL(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
          active_orders INTEGER DEFAULT 0 CHECK (active_orders >= 0),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create orders table
      await client.query(`
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
        )
      `);

      // Create ADL attachments table
      await client.query(`
        CREATE TABLE IF NOT EXISTS adl_attachments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          file_path VARCHAR(500) NOT NULL,
          file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('photo', 'video')),
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_orders_master_id ON orders(master_id);
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
        CREATE INDEX IF NOT EXISTS idx_masters_rating ON masters(rating);
        CREATE INDEX IF NOT EXISTS idx_masters_active_orders ON masters(active_orders);
        CREATE INDEX IF NOT EXISTS idx_adl_attachments_order_id ON adl_attachments(order_id);
      `);

      console.log('✅ Database tables created successfully');
    } finally {
      client.release();
    }
  }

  private async insertSampleMasters(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      // Check if masters already exist
      const result = await client.query('SELECT id FROM masters LIMIT 1');
      if (result.rows.length > 0) {
        console.log('✅ Sample masters already exist');
        return;
      }

      const sampleMasters = [
        { name: 'John Smith', phone: '+1234567890', lat: 40.7128, lng: -74.0060, rating: 4.8 },
        { name: 'Sarah Johnson', phone: '+1234567891', lat: 40.7589, lng: -73.9851, rating: 4.9 },
        { name: 'Mike Wilson', phone: '+1234567892', lat: 40.7505, lng: -73.9934, rating: 4.7 },
        { name: 'Lisa Brown', phone: '+1234567893', lat: 40.7614, lng: -73.9776, rating: 4.6 },
        { name: 'David Lee', phone: '+1234567894', lat: 40.7282, lng: -73.9942, rating: 4.5 }
      ];

      for (const master of sampleMasters) {
        await client.query(`
          INSERT INTO masters (name, phone, latitude, longitude, rating, active_orders)
          VALUES ($1, $2, $3, $4, $5, 0)
        `, [master.name, master.phone, master.lat, master.lng, master.rating]);
      }

      console.log('✅ Sample masters inserted successfully');
    } finally {
      client.release();
    }
  }

  async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<string> {
    const client = await this.pool.connect();
    
    try {
      const id = uuidv4();
      
      const result = await client.query(`
        INSERT INTO orders (id, customer_name, customer_phone, address, latitude, longitude, description, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [id, order.customer_name, order.customer_phone, order.address, order.latitude, order.longitude, order.description, order.status]);
      
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getAllOrders(): Promise<Order[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM orders ORDER BY created_at DESC');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async assignMaster(orderId: string, masterId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update order
      await client.query(`
        UPDATE orders 
        SET master_id = $1, status = 'assigned', assigned_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [masterId, orderId]);
      
      // Update master active orders count
      await client.query(`
        UPDATE masters 
        SET active_orders = active_orders + 1 
        WHERE id = $1
      `, [masterId]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAndAssignBestMaster(orderId: string, maxDistance: number = 50): Promise<Master | null> {
    const client = await this.pool.connect();
    
    try {
      // Get order coordinates
      const orderResult = await client.query(
        'SELECT latitude, longitude FROM orders WHERE id = $1', 
        [orderId]
      );
      
      if (orderResult.rows.length === 0) {
        throw new Error('Order not found');
      }
      
      const order = orderResult.rows[0];
      
      // Get all available masters
      const mastersResult = await client.query(
        'SELECT * FROM masters WHERE active_orders < 10 ORDER BY rating DESC, active_orders ASC'
      );
      
      if (mastersResult.rows.length === 0) {
        return null;
      }
      
      // Import haversine service
      const { findBestMaster } = await import('./haversineService.js');
      
      // Find best master
      const bestMaster = findBestMaster(
        mastersResult.rows, 
        order.latitude, 
        order.longitude, 
        maxDistance
      );
      
      if (bestMaster) {
        // Assign the master
        await this.assignMaster(orderId, bestMaster.id);
        return bestMaster;
      }
      
      return null;
    } finally {
      client.release();
    }
  }

  async getAllMasters(): Promise<Master[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM masters ORDER BY rating DESC');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getMaster(id: string): Promise<Master | null> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM masters WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async addADLAttachment(attachment: Omit<ADLAttachment, 'id' | 'created_at'>): Promise<string> {
    const client = await this.pool.connect();
    
    try {
      const id = uuidv4();
      
      const result = await client.query(`
        INSERT INTO adl_attachments (id, order_id, file_path, file_type, latitude, longitude, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [id, attachment.order_id, attachment.file_path, attachment.file_type, 
          attachment.latitude, attachment.longitude, attachment.timestamp]);
      
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  async getADLAttachments(orderId: string): Promise<ADLAttachment[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM adl_attachments 
        WHERE order_id = $1 
        ORDER BY created_at DESC
      `, [orderId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async completeOrder(orderId: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if order has ADL attachments before completion
      const adlResult = await client.query(
        'SELECT COUNT(*) as count FROM adl_attachments WHERE order_id = $1', 
        [orderId]
      );
      
      if (parseInt(adlResult.rows[0].count) === 0) {
        throw new Error('Order cannot be completed without ADL attachments');
      }
      
      // Get the order to find the master
      const orderResult = await client.query('SELECT master_id FROM orders WHERE id = $1', [orderId]);
      const order = orderResult.rows[0];
      
      if (order?.master_id) {
        await client.query(`
          UPDATE masters 
          SET active_orders = active_orders - 1 
          WHERE id = $1
        `, [order.master_id]);
      }
      
      await client.query(`
        UPDATE orders 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [orderId]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();
