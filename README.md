# RestaurantePRO — Sistema de Gestión de Restaurante

Sistema completo para la gestión de un restaurante: pedidos, cocina, caja, créditos, menús semanales, reportes y administración de usuarios, todo con actualizaciones en tiempo real.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 (Create React App) |
| Backend | Node.js + Express |
| Base de datos | MongoDB + Mongoose |
| Tiempo real | Socket.IO |
| Deploy | Render (2 servicios independientes) |
| Exportación | jsPDF + XLSX |
| Íconos | Lucide React |
| Gráficos | Recharts |

---

## Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| **Auth** | Login y control de sesión basado en roles y permisos |
| **Pedidos** | Crear, editar y cancelar pedidos con estados en tiempo real |
| **Cocina** | Vista de pedidos pendientes y en preparación para cocineros |
| **Caja** | Cobro de pedidos con múltiples métodos de pago |
| **Créditos** | Gestión de deudas por cliente con pago parcial/total (FIFO) |
| **Menú del Día** | Vista semanal con categorías, precios por tipo y exportación PDF/Excel |
| **Platos** | Catálogo de platos por categoría con disponibilidad |
| **Clientes** | Registro y búsqueda de clientes |
| **Reportes** | Gráficos de ventas, métodos de pago y estados de pedidos |
| **Usuarios** | Administración de usuarios del sistema |
| **Roles** | Gestión de roles y permisos granulares |
| **Cierre de Turno** | Resumen de ventas y cierre de caja por turno |

---

## Roles y Permisos

| Rol | Accesos |
|-----|---------|
| **Administrador** | Acceso total al sistema |
| **Mesero** | Clientes, pedidos propios, cobros, ver platos y menú |
| **Cocinero** | Ver pedidos, actualizar estado de preparación |
| **Cajero** | Cobros, créditos y reportes de caja |

**Credenciales por defecto:** `admin` / `admin123`

---

## Estructura del Proyecto

```
restaurante-sistema/
├── backend/
│   ├── config/          # CORS, base de datos, Socket.IO, permisos
│   ├── controllers/     # Lógica de negocio por módulo
│   ├── models/          # Esquemas Mongoose
│   ├── routes/          # Endpoints de la API REST
│   ├── utils/           # Seeders y helpers
│   └── server.js        # Punto de entrada
│
└── frontend/
    └── src/
        ├── components/  # Módulos (cada uno con components/, hooks/, utils/)
        └── services/    # Servicios de consumo de la API
```

---

## API REST

| Ruta | Métodos disponibles |
|------|---------------------|
| `/api/auth` | POST /login |
| `/api/clientes` | GET, POST, PUT /:id, DELETE /:id |
| `/api/platos` | GET /:tipo, POST, PUT /:id, DELETE /:id |
| `/api/pedidos` | GET /hoy, GET /rango, POST, PUT /:id, PATCH /:id/estado, PATCH /:id/pago, PATCH /:id/cancelar |
| `/api/menu-dia` | GET /hoy, GET /fecha/:fecha, GET, POST, PUT /:id, DELETE /:id, PATCH /:id/toggle |
| `/api/creditos` | GET /clientes, POST /:clienteId/pagar |
| `/api/roles` | GET, POST, PUT /:id, DELETE /:id |
| `/api/usuarios` | GET, POST, PUT /:id, DELETE /:id |
| `/api/cierresTurno` | GET, POST |

---

## Eventos Socket.IO (Tiempo Real)

| Evento | Descripción |
|--------|-------------|
| `pedido-creado` | Nuevo pedido registrado |
| `pedido-actualizado` | Estado o pago del pedido modificado |
| `menu-creado` | Nuevo menú del día creado |
| `menu-actualizado` | Menú modificado o activado/desactivado |
| `credito-actualizado` | Pago de crédito registrado |

---

## Instalación y Desarrollo Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/programacionmsb/restaurante-sistema.git
cd restaurante-sistema
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # Configurar variables de entorno
npm run dev
```

Variables requeridas en `.env`:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/restaurante
PORT=5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

El frontend corre en `http://localhost:3000` y consume el backend en Render por defecto.

---

## Deploy en Render

### Backend — Web Service

| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Variables de entorno | `MONGODB_URI`, `PORT` |

### Frontend — Static Site

| Campo | Valor |
|-------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `build` |

---

## Contacto

**+51 931 870 297**
