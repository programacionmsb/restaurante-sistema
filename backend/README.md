# 🚀 RestaurantePRO - Backend Modular

Backend profesional y modularizado para el sistema de gestión de restaurantes.

## 📁 Estructura del Proyecto

```
backend/
├── server.js                 # Archivo principal
├── package.json             # Dependencias
├── .env.example             # Variables de entorno (ejemplo)
├── .gitignore               # Archivos ignorados por Git
│
├── config/                  # Configuración
│   ├── database.js         # Conexión MongoDB
│   ├── cors.js             # Configuración CORS
│   ├── permisos.js         # Catálogo de permisos
│   └── socketio.js         # Configuración Socket.IO
│
├── models/                  # Modelos de datos
│   ├── Cliente.js
│   ├── Plato.js
│   ├── Pedido.js
│   ├── Rol.js
│   ├── Usuario.js
│   └── MenuDia.js
│
├── controllers/             # Lógica de negocio
│   ├── clientesController.js
│   ├── platosController.js
│   ├── pedidosController.js
│   ├── rolesController.js
│   ├── usuariosController.js
│   ├── authController.js
│   └── menuDiaController.js
│
├── routes/                  # Rutas de la API
│   ├── clientes.js
│   ├── platos.js
│   ├── pedidos.js
│   ├── roles.js
│   ├── usuarios.js
│   ├── auth.js
│   └── menuDia.js
│
└── utils/                   # Utilidades
    ├── seeders.js          # Crear roles y admin inicial
    └── helpers.js          # Funciones auxiliares
```

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env`:

```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/restaurante
PORT=5000
```

### 4. Iniciar el servidor

**Modo desarrollo:**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Platos
- `GET /api/platos/:tipo` - Obtener platos por tipo
- `POST /api/platos` - Crear plato
- `PUT /api/platos/:id` - Actualizar plato
- `DELETE /api/platos/:id` - Eliminar plato

### Pedidos
- `GET /api/pedidos/hoy` - Pedidos de hoy
- `GET /api/pedidos/rango` - Pedidos por rango de fechas
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/:id` - Actualizar pedido
- `PATCH /api/pedidos/:id/estado` - Cambiar estado
- `PATCH /api/pedidos/:id/pago` - Registrar pago
- `PATCH /api/pedidos/:id/cancelar` - Cancelar pedido

### Roles
- `GET /api/roles/permisos-disponibles` - Obtener permisos
- `GET /api/roles` - Obtener todos los roles
- `GET /api/roles/:id` - Obtener rol por ID
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Menú del Día
- `GET /api/menu-dia/hoy` - Menús de hoy
- `GET /api/menu-dia/fecha/:fecha` - Menús por fecha
- `GET /api/menu-dia/:id` - Obtener menú por ID
- `GET /api/menu-dia` - Obtener todos los menús
- `POST /api/menu-dia` - Crear menú
- `PUT /api/menu-dia/:id` - Actualizar menú
- `DELETE /api/menu-dia/:id` - Eliminar menú
- `PATCH /api/menu-dia/:id/toggle` - Activar/Desactivar menú

## 🔒 Sistema de Permisos

El sistema utiliza roles predefinidos con permisos específicos:

### Roles Predefinidos

**Administrador**
- Acceso total al sistema

**Mesero**
- Ver y crear clientes
- Crear y editar pedidos propios
- Cobrar pedidos
- Ver platos y menú

**Cocinero**
- Ver pedidos en cocina
- Actualizar estado de pedidos
- Ver platos y menú

**Cajero**
- Cobrar pedidos
- Ver reportes de caja
- Ver todos los pedidos

## 🚀 Deploy en Render

### 1. Conectar repositorio

En Render:
1. New → Web Service
2. Conectar tu repositorio
3. Configurar:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 2. Variables de entorno

Agregar en Render:
- `MONGODB_URI` - Tu URI de MongoDB Atlas
- `PORT` - 5000 (opcional)

## 📊 Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **Socket.IO** - WebSockets en tiempo real
- **CORS** - Manejo de CORS

## 👨‍💻 Desarrollo

### Estructura modular

El proyecto sigue el patrón **MVC** (Model-View-Controller):

- **Models:** Definen la estructura de los datos
- **Controllers:** Contienen la lógica de negocio
- **Routes:** Definen los endpoints de la API
- **Config:** Archivos de configuración
- **Utils:** Funciones auxiliares

### Ventajas de esta estructura

✅ **Organizado** - Fácil de navegar
✅ **Mantenible** - Cambios aislados
✅ **Escalable** - Fácil agregar funcionalidades
✅ **Testeable** - Pruebas unitarias simples
✅ **Profesional** - Estándar de la industria

## 📝 Notas

- El sistema crea automáticamente roles y usuario admin al iniciar
- Credenciales por defecto: `admin` / `admin123`
- Socket.IO emite eventos en tiempo real para actualizar el frontend

## 🆘 Soporte

Si encuentras algún problema, revisa:
1. Conexión a MongoDB Atlas
2. Variables de entorno configuradas
3. Logs del servidor

---

**Hecho con ❤️ para RestaurantePRO**
