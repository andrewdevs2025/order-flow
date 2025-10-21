import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nexa_order_flow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Check if masters already exist
    const result = await client.query('SELECT id FROM masters LIMIT 1');
    if (result.rows.length > 0) {
      console.log('✅ Sample data already exists');
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
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
