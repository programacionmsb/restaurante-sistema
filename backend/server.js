const express = require('express');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configuración
const { setupCORS } = require('./config/cors');
const { connectDatabase } = require('./config/database');
const { setupSocketIO } = require('./config/socketio');

// Middleware
app.use(express.json());
setupCORS(app);

// Socket.IO
const io = setupSocketIO(server);
global.io = io; // Para usar en cualquier parte

// Rutas
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/platos', require('./routes/platos'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu-dia', require('./routes/menuDia'));
app.use('/api/cierres-turno', require('./routes/cierresTurno'));
app.use('/api/creditos', require('./routes/creditos'));  // ← NUEVA LÍNEA

// Ruta principal
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Sistema de Restaurante funcionando' });
});

// Conectar DB e iniciar servidor
connectDatabase().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
});