const MenuDia = require('../models/MenuDia');
const Plato = require('../models/Plato');
const { emitirActualizacion } = require('../utils/helpers');

exports.getHoy = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const menus = await MenuDia.find({
      fecha: { $gte: hoy, $lt: manana },
      activo: true
    }).populate('categorias.platos.platoId').sort({ nombre: 1 });
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPorFecha = async (req, res) => {
  try {
    const fecha = new Date(req.params.fecha);
    fecha.setHours(0, 0, 0, 0);
    
    const siguiente = new Date(fecha);
    siguiente.setDate(siguiente.getDate() + 1);
    
    const menus = await MenuDia.find({
      fecha: { $gte: fecha, $lt: siguiente }
    }).populate('categorias.platos.platoId').sort({ nombre: 1 });
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const menu = await MenuDia.findById(req.params.id).populate('categorias.platos.platoId');
    
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { limit = 30, activo, fechaInicio, fechaFin } = req.query;
    
    const filtro = {};
    
    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }
    
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      
      filtro.fecha = { $gte: inicio, $lte: fin };
    }
    
    const menus = await MenuDia.find(filtro)
      .sort({ fecha: 1, nombre: 1 })
      .limit(parseInt(limit))
      .populate('categorias.platos.platoId');
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { fecha, nombre, descripcion, categorias, precioCompleto } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre del menú es obligatorio' });
    }
    
    const fechaStr = fecha.split('T')[0];
    const fechaDate = new Date(fechaStr + 'T00:00:00.000Z');
    
    const menuExistente = await MenuDia.findOne({
      fecha: fechaDate,
      nombre: nombre.trim()
    });
    
    if (menuExistente) {
      return res.status(400).json({ 
        error: 'Ya existe un menú con este nombre para esta fecha' 
      });
    }
    
    const categoriasCompletas = await Promise.all(
      categorias.map(async (cat) => {
        const platosCompletos = await Promise.all(
          cat.platos.map(async (p) => {
            const plato = await Plato.findById(p.platoId);
            if (!plato) {
              throw new Error(`Plato con ID ${p.platoId} no encontrado`);
            }
            return {
              platoId: p.platoId,
              nombre: plato.nombre,
              precio: p.precio !== undefined ? p.precio : plato.precio,
              disponible: p.disponible !== undefined ? p.disponible : true
            };
          })
        );
        
        return {
          nombre: cat.nombre,
          platos: platosCompletos
        };
      })
    );
    
    const nuevoMenu = new MenuDia({
      fecha: fechaDate,
      nombre: nombre.trim(),
      descripcion: descripcion || '',
      categorias: categoriasCompletas,
      precioCompleto: precioCompleto || 0,
      activo: true
    });
    
    await nuevoMenu.save();
    emitirActualizacion('menu-creado', nuevoMenu);
    res.status(201).json(nuevoMenu);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { fecha, nombre, descripcion, categorias, precioCompleto, activo } = req.body;
    
    const menu = await MenuDia.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }

    // ===== FIX: actualizar fecha si viene en el body =====
    if (fecha) {
      const fechaStr = fecha.split('T')[0];
      const fechaNueva = new Date(fechaStr + 'T00:00:00.000Z');
      menu.fecha = fechaNueva;
    }
    
    if (nombre && nombre.trim() !== menu.nombre) {
      const fechaMenu = menu.fecha;
      
      const menuConMismoNombre = await MenuDia.findOne({
        _id: { $ne: req.params.id },
        fecha: fechaMenu,
        nombre: nombre.trim()
      });
      
      if (menuConMismoNombre) {
        return res.status(400).json({ 
          error: 'Ya existe un menú con este nombre para esta fecha' 
        });
      }
    }
    
    if (categorias) {
      const categoriasCompletas = await Promise.all(
        categorias.map(async (cat) => {
          const platosCompletos = await Promise.all(
            cat.platos.map(async (p) => {
              const plato = await Plato.findById(p.platoId);
              if (!plato) {
                throw new Error(`Plato con ID ${p.platoId} no encontrado`);
              }
              return {
                platoId: p.platoId,
                nombre: plato.nombre,
                precio: p.precio !== undefined ? p.precio : plato.precio,
                disponible: p.disponible !== undefined ? p.disponible : true
              };
            })
          );
          
          return {
            nombre: cat.nombre,
            platos: platosCompletos
          };
        })
      );
      menu.categorias = categoriasCompletas;
    }
    
    if (nombre) menu.nombre = nombre.trim();
    if (descripcion !== undefined) menu.descripcion = descripcion;
    if (precioCompleto !== undefined) menu.precioCompleto = precioCompleto;
    if (activo !== undefined) menu.activo = activo;
    
    await menu.save();
    emitirActualizacion('menu-actualizado', menu);
    res.json(menu);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Ya existe un menú con este nombre para esta fecha' 
      });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const menu = await MenuDia.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    emitirActualizacion('menu-eliminado', req.params.id);
    res.json({ message: 'Menú eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggle = async (req, res) => {
  try {
    const menu = await MenuDia.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    
    menu.activo = !menu.activo;
    await menu.save();
    
    emitirActualizacion('menu-actualizado', menu);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDisponibilidadPlato = async (req, res) => {
  try {
    const { menuId, platoId } = req.params;
    const { disponible } = req.body;
    
    const menu = await MenuDia.findById(menuId);
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    
    let platoEncontrado = false;
    menu.categorias.forEach(cat => {
      const plato = cat.platos.find(p => p.platoId.toString() === platoId);
      if (plato) {
        plato.disponible = disponible;
        platoEncontrado = true;
      }
    });
    
    if (!platoEncontrado) {
      return res.status(404).json({ error: 'Plato no encontrado en este menú' });
    }
    
    await menu.save();
    emitirActualizacion('menu-actualizado', menu);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};