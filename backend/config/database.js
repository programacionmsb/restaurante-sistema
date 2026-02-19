const mongoose = require('mongoose');
const { crearRolesPredefinidos } = require('../utils/seeders');

const connectDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Crear roles y admin si no existen
    await crearRolesPredefinidos();
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

module.exports = { connectDatabase };
