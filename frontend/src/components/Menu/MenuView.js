import React, { useState, useEffect } from 'react';
import { Calendar, Save, Plus, Trash2, Edit2, X, Eye, EyeOff, ChevronLeft, ChevronRight, FileDown, FileSpreadsheet } from 'lucide-react';
import { menuAPI } from '../../services/apiMenu';
import { platosAPI } from '../../services/apiPlatos';
import ProtectedAction from '../ProtectedAction';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './menu.css';

export default function MenuView() {
  const [semanaActual, setSemanaActual] = useState(getInicioSemana(new Date()));
  const [menus, setMenus] = useState([]);
  const [menuSeleccionado, setMenuSeleccionado] = useState(null);
  const [platosDisponibles, setPlatosDisponibles] = useState({
    entrada: [],
    plato: [],
    bebida: [],
    postre: []
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [esNuevoMenu, setEsNuevoMenu] = useState(false);
  const [nombreMenu, setNombreMenu] = useState('');
  const [descripcionMenu, setDescripcionMenu] = useState('');
  const [precioCompleto, setPrecioCompleto] = useState(0);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

  // Función para obtener el lunes de la semana
  function getInicioSemana(fecha) {
    const d = new Date(fecha);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Función para obtener el domingo de la semana
  function getFinSemana(inicioSemana) {
    const fin = new Date(inicioSemana);
    fin.setDate(fin.getDate() + 6);
    return fin;
  }

  useEffect(() => {
    cargarDatos();
    cargarPlatos();
  }, [semanaActual]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const inicio = new Date(semanaActual);
      const fin = getFinSemana(inicio);
      
      const menusData = await menuAPI.getPorRango(
        inicio.toISOString().split('T')[0],
        fin.toISOString().split('T')[0]
      );
      
      setMenus(menusData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar menús de la semana');
    } finally {
      setLoading(false);
    }
  };

  const cargarPlatos = async () => {
    try {
      const [entradas, platos, bebidas, postres] = await Promise.all([
        platosAPI.getByTipo('entrada'),
        platosAPI.getByTipo('plato'),
        platosAPI.getByTipo('bebida'),
        platosAPI.getByTipo('postre')
      ]);

      setPlatosDisponibles({
        entrada: entradas,
        plato: platos,
        bebida: bebidas,
        postre: postres
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ========== FUNCIONES DE EXPORTACIÓN POR DÍA ==========
  
  const exportarDiaPDF = (dia) => {
    const menusDia = getMenusPorFecha(dia).filter(m => m.activo);
    
    if (menusDia.length === 0) {
      alert('No hay menús activos para este día');
      return;
    }
    
    const doc = new jsPDF();
    const fecha = new Date(dia);
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Fondo marrón oscuro
    doc.setFillColor(70, 48, 33);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Header decorativo con patrón
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Círculos decorativos (simulando platos)
    doc.setFillColor(205, 127, 50);
    doc.circle(30, 25, 12, 'F');
    doc.circle(180, 25, 12, 'F');
    
    // Iconos de cubiertos (simulados con texto)
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('🍴', 25, 28);
    doc.text('🍴', 175, 28);
    
    // Título principal
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Menú del Día', 105, 30, { align: 'center' });
    
    // Fecha
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const fechaTexto = `${diasSemana[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    doc.text(fechaTexto, 105, 42, { align: 'center' });
    
    let yPos = 65;
    
    // Por cada menú del día
    menusDia.forEach((menu, menuIndex) => {
      if (menuIndex > 0) {
        yPos += 10;
      }
      
      // Separador decorativo
      if (menusDia.length > 1) {
        doc.setDrawColor(205, 127, 50);
        doc.setLineWidth(0.5);
        doc.line(30, yPos - 5, 180, yPos - 5);
        yPos += 5;
      }
      
      // Nombre del menú
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 215, 0);
      doc.text(menu.nombre, 105, yPos, { align: 'center' });
      yPos += 8;
      
      // Descripción si existe
      if (menu.descripcion) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(220, 220, 220);
        doc.text(menu.descripcion, 105, yPos, { align: 'center', maxWidth: 150 });
        yPos += 8;
      }
      
      // Categorías
      menu.categorias.forEach(categoria => {
        // Header de categoría con fondo
        doc.setFillColor(205, 127, 50);
        doc.roundedRect(35, yPos - 2, 140, 10, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        
        const categoriaLabels = {
          'Entrada': '🥗 ENTRADA',
          'Plato Principal': '🍖 PLATO PRINCIPAL',
          'Bebida': '🥤 BEBIDA',
          'Postre': '🍰 POSTRE'
        };
        
        doc.text(categoriaLabels[categoria.nombre] || categoria.nombre.toUpperCase(), 105, yPos + 6, { align: 'center' });
        yPos += 15;
        
        // Platos de la categoría
        categoria.platos.forEach(plato => {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(255, 255, 255);
          
          // Bullet point
          doc.setFillColor(205, 127, 50);
          doc.circle(42, yPos - 1, 1.5, 'F');
          
          doc.text(plato.nombre, 48, yPos);
          
          // Precio a la derecha
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(144, 238, 144);
          doc.text(`S/ ${plato.precio.toFixed(2)}`, 168, yPos);
          
          yPos += 7;
        });
        
        yPos += 3;
      });
      
      // Precio menú completo
      if (menu.precioCompleto > 0) {
        yPos += 5;
        doc.setFillColor(34, 139, 34);
        doc.roundedRect(50, yPos - 2, 110, 12, 3, 3, 'F');
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('MENÚ COMPLETO:', 70, yPos + 6);
        
        doc.setFontSize(16);
        doc.setTextColor(255, 215, 0);
        doc.text(`S/ ${menu.precioCompleto.toFixed(2)}`, 145, yPos + 6);
        
        yPos += 18;
      }
    });
    
    // Footer decorativo
    const footerY = 270;
    doc.setFillColor(139, 69, 19);
    doc.rect(0, footerY, 210, 27, 'F');
    
    // Decoración footer
    doc.setFillColor(205, 127, 50);
    doc.circle(25, footerY + 13, 8, 'F');
    doc.circle(185, footerY + 13, 8, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('🍽️', 21, footerY + 16);
    doc.text('☕', 181, footerY + 16);
    
    // Texto de contacto
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(255, 255, 255);
    doc.text('Realiza tu pedido:', 105, footerY + 10, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text('📞 +51 931 870 297', 105, footerY + 20, { align: 'center' });
    
    const nombreArchivo = `menu-${diasSemana[fecha.getDay()]}-${fecha.getDate()}-${meses[fecha.getMonth()]}.pdf`;
    doc.save(nombreArchivo);
  };

  const exportarDiaExcel = (dia) => {
    const menusDia = getMenusPorFecha(dia).filter(m => m.activo);
    
    if (menusDia.length === 0) {
      alert('No hay menús activos para este día');
      return;
    }
    
    const fecha = new Date(dia);
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const data = [];
    
    data.push(['MENÚ DEL DÍA']);
    data.push([`${diasSemana[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`]);
    data.push([]);
    
    menusDia.forEach((menu, index) => {
      if (index > 0) {
        data.push([]);
        data.push(['-----------------------------------']);
        data.push([]);
      }
      
      data.push([menu.nombre]);
      if (menu.descripcion) {
        data.push([menu.descripcion]);
      }
      data.push([]);
      
      menu.categorias.forEach(categoria => {
        data.push([categoria.nombre.toUpperCase()]);
        categoria.platos.forEach(plato => {
          data.push(['', plato.nombre, `S/ ${plato.precio.toFixed(2)}`]);
        });
        data.push([]);
      });
      
      if (menu.precioCompleto > 0) {
        data.push(['MENÚ COMPLETO', '', `S/ ${menu.precioCompleto.toFixed(2)}`]);
        data.push([]);
      }
    });
    
    data.push([]);
    data.push(['Realiza tu pedido: 📞 +51 931 870 297']);
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 15 }
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menú del Día');
    
    const nombreArchivo = `menu-${diasSemana[fecha.getDay()]}-${fecha.getDate()}-${meses[fecha.getMonth()]}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  };

  const exportarSemanaPDF = () => {
    const doc = new jsPDF();
    
    // Fondo
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Header
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('MENÚS DE LA SEMANA', 105, 18, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${inicioSemanaStr} - ${finSemanaStr}`, 105, 30, { align: 'center' });
    
    let yPos = 50;
    
    diasSemanales.forEach((dia, index) => {
      const menusDia = getMenusPorFecha(dia).filter(m => m.activo);
      
      if (menusDia.length > 0) {
        // Día de la semana
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(236, 72, 153);
        doc.roundedRect(15, yPos, 180, 12, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const textoFecha = `${diasSemana[dia.getDay()]} ${dia.getDate()}`;
        doc.text(textoFecha, 20, yPos + 8);
        
        yPos += 18;
        
        menusDia.forEach(menu => {
          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`• ${menu.nombre}`, 20, yPos);
          
          if (menu.precioCompleto > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(16, 185, 129);
            doc.text(`S/ ${menu.precioCompleto.toFixed(2)}`, 180, yPos, { align: 'right' });
          }
          
          yPos += 7;
          
          menu.categorias.forEach(categoria => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(100, 100, 100);
            doc.text(categoria.nombre + ':', 25, yPos);
            
            yPos += 5;
            
            categoria.platos.forEach(plato => {
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(60, 60, 60);
              doc.text(`  • ${plato.nombre}`, 30, yPos);
              yPos += 4;
            });
            
            yPos += 2;
          });
          
          yPos += 5;
        });
        
        yPos += 3;
      }
      
      // Nueva página si es necesario
      if (yPos > 250 && index < diasSemanales.length - 1) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    doc.save(`menus-semana-${semanaActual.toISOString().split('T')[0]}.pdf`);
  };

  const exportarSemanaExcel = () => {
    const data = [];
    
    data.push(['MENÚS DE LA SEMANA']);
    data.push([`${inicioSemanaStr} - ${finSemanaStr}`]);
    data.push([]);
    
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    diasSemanales.forEach(dia => {
      const menusDia = getMenusPorFecha(dia).filter(m => m.activo);
      
      if (menusDia.length > 0) {
        data.push([`${diasSemana[dia.getDay()]} ${dia.getDate()}`]);
        
        menusDia.forEach(menu => {
          data.push(['', menu.nombre, menu.precioCompleto > 0 ? `S/ ${menu.precioCompleto.toFixed(2)}` : '']);
          
          menu.categorias.forEach(categoria => {
            data.push(['', '', categoria.nombre]);
            categoria.platos.forEach(plato => {
              data.push(['', '', '', plato.nombre, `S/ ${plato.precio.toFixed(2)}`]);
            });
          });
          
          data.push([]);
        });
        
        data.push([]);
      }
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 12 }];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Semana');
    
    XLSX.writeFile(wb, `menus-semana-${semanaActual.toISOString().split('T')[0]}.xlsx`);
  };

  // ========== RESTO DE FUNCIONES ==========

  const cambiarSemana = (direccion) => {
    const nuevaFecha = new Date(semanaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + (direccion * 7));
    setSemanaActual(getInicioSemana(nuevaFecha));
  };

  const irSemanaActual = () => {
    setSemanaActual(getInicioSemana(new Date()));
  };

  const crearNuevoMenu = (fecha = null) => {
    setEsNuevoMenu(true);
    setMenuSeleccionado(null);
    setNombreMenu('');
    setDescripcionMenu('');
    setPrecioCompleto(0);
    setCategorias([]);
    setFechaSeleccionada(fecha || new Date().toISOString().split('T')[0]);
    setModoEdicion(true);
  };

  const editarMenu = (menu) => {
    setEsNuevoMenu(false);
    setMenuSeleccionado(menu);
    setNombreMenu(menu.nombre);
    setDescripcionMenu(menu.descripcion || '');
    setPrecioCompleto(menu.precioCompleto || 0);
    setFechaSeleccionada(new Date(menu.fecha).toISOString().split('T')[0]);
    
    const categoriasParaEdicion = menu.categorias.map(cat => ({
      nombre: cat.nombre,
      platos: cat.platos.map(plato => ({
        platoId: typeof plato.platoId === 'string' ? plato.platoId : plato.platoId._id
      }))
    }));
    
    setCategorias(categoriasParaEdicion);
    setModoEdicion(true);
  };

  const eliminarMenu = async (menuId) => {
    if (!window.confirm('¿Estás seguro de eliminar este menú?')) return;

    try {
      await menuAPI.delete(menuId);
      alert('Menú eliminado correctamente');
      cargarDatos();
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleMenuActivo = async (menuId) => {
    try {
      await menuAPI.toggle(menuId);
      cargarDatos();
    } catch (error) {
      alert(error.message);
    }
  };

  const agregarCategoria = (nombreCategoria) => {
    const categoriaExiste = categorias.find(c => c.nombre === nombreCategoria);
    if (categoriaExiste) {
      alert('Esta categoría ya está agregada');
      return;
    }
    setCategorias([...categorias, { nombre: nombreCategoria, platos: [] }]);
  };

  const eliminarCategoria = (nombreCategoria) => {
    if (window.confirm(`¿Eliminar la categoría "${nombreCategoria}"?`)) {
      setCategorias(categorias.filter(c => c.nombre !== nombreCategoria));
    }
  };

  const agregarPlatoACategoria = (nombreCategoria, platoId) => {
    setCategorias(categorias.map(cat => {
      if (cat.nombre === nombreCategoria) {
        if (cat.platos.some(p => p.platoId === platoId)) {
          return cat;
        }
        return {
          ...cat,
          platos: [...cat.platos, { platoId }]
        };
      }
      return cat;
    }));
  };

  const eliminarPlatoDeCategoria = (nombreCategoria, platoId) => {
    setCategorias(categorias.map(cat => {
      if (cat.nombre === nombreCategoria) {
        return {
          ...cat,
          platos: cat.platos.filter(p => p.platoId !== platoId)
        };
      }
      return cat;
    }));
  };

  const handleGuardarMenu = async () => {
    if (!nombreMenu.trim()) {
      alert('El nombre del menú es obligatorio');
      return;
    }

    if (!fechaSeleccionada) {
      alert('Selecciona una fecha para el menú');
      return;
    }

    if (categorias.length === 0) {
      alert('Agrega al menos una categoría al menú');
      return;
    }

    const totalPlatos = categorias.reduce((sum, cat) => sum + cat.platos.length, 0);
    if (totalPlatos === 0) {
      alert('Agrega al menos un plato al menú');
      return;
    }

    try {
      const menuData = {
        fecha: fechaSeleccionada,
        nombre: nombreMenu.trim(),
        descripcion: descripcionMenu,
        categorias: categorias,
        precioCompleto: parseFloat(precioCompleto) || 0
      };

      if (esNuevoMenu) {
        await menuAPI.create(menuData);
        alert('Menú creado correctamente');
      } else {
        await menuAPI.update(menuSeleccionado._id, menuData);
        alert('Menú actualizado correctamente');
      }

      setModoEdicion(false);
      cargarDatos();
    } catch (error) {
      alert(error.message);
    }
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setEsNuevoMenu(false);
    setMenuSeleccionado(null);
    setNombreMenu('');
    setDescripcionMenu('');
    setPrecioCompleto(0);
    setCategorias([]);
    setFechaSeleccionada('');
  };

  const getCategoriaLabel = (nombre) => {
    const labels = {
      'Entrada': '🥗 Entradas',
      'Plato Principal': '🍖 Platos Principales',
      'Bebida': '🥤 Bebidas',
      'Postre': '🍰 Postres'
    };
    return labels[nombre] || nombre;
  };

  const getTipoPorCategoria = (nombreCategoria) => {
    const map = {
      'Entrada': 'entrada',
      'Plato Principal': 'plato',
      'Bebida': 'bebida',
      'Postre': 'postre'
    };
    return map[nombreCategoria] || 'plato';
  };

  const getPlatoInfo = (platoId) => {
    for (const [tipo, platos] of Object.entries(platosDisponibles)) {
      const plato = platos.find(p => p._id === platoId);
      if (plato) return plato;
    }
    return null;
  };

  const getDiasSemanales = () => {
    const dias = [];
    const inicio = new Date(semanaActual);
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(fecha.getDate() + i);
      dias.push(fecha);
    }
    
    return dias;
  };

  const getMenusPorFecha = (fecha) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return menus.filter(m => {
      const menuFecha = new Date(m.fecha).toISOString().split('T')[0];
      return menuFecha === fechaStr;
    });
  };

  const formatFecha = (fecha) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[fecha.getDay()]} ${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  };

  const totalPlatosMenu = categorias.reduce((sum, cat) => sum + cat.platos.length, 0);
  const diasSemanales = getDiasSemanales();
  const inicioSemanaStr = formatFecha(semanaActual);
  const finSemanaStr = formatFecha(getFinSemana(semanaActual));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Calendar size={48} className="loading-icon" />
          <h2>Cargando menús...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {/* Header */}
      <header className="menu-header">
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={32} color="#ec4899" />
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Menú del Día</h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Gestión de Menús Semanales</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="menu-main">
        <div className="menu-card">
          {/* Modo Edición */}
          {modoEdicion ? (
            <>
              {/* Botones de acción */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
                  {esNuevoMenu ? 'Crear Nuevo Menú' : 'Editar Menú'}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={cancelarEdicion}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <X size={20} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardarMenu}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Save size={20} />
                    Guardar Menú
                  </button>
                </div>
              </div>

              {/* Información del menú */}
              <div style={{ 
                background: '#f9fafb', 
                padding: '1.5rem', 
                borderRadius: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937' }}>
                  Información del Menú
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Nombre del Menú *
                    </label>
                    <input
                      type="text"
                      value={nombreMenu}
                      onChange={(e) => setNombreMenu(e.target.value)}
                      placeholder="Ej: Menú Ejecutivo, Menú Vegetariano, Menú Kids..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={fechaSeleccionada}
                      onChange={(e) => setFechaSeleccionada(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Precio Completo
                    </label>
                    <input
                      type="number"
                      value={precioCompleto}
                      onChange={(e) => setPrecioCompleto(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #d1d5db',
                        borderRadius: '0.5rem',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Descripción
                  </label>
                  <textarea
                    value={descripcionMenu}
                    onChange={(e) => setDescripcionMenu(e.target.value)}
                    placeholder="Descripción del menú..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Agregar categorías */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', color: '#1f2937' }}>
                  Categorías del Menú ({categorias.length})
                </h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['Entrada', 'Plato Principal', 'Bebida', 'Postre'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => agregarCategoria(cat)}
                      disabled={categorias.some(c => c.nombre === cat)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: categorias.some(c => c.nombre === cat) ? '#d1d5db' : '#ec4899',
                        color: categorias.some(c => c.nombre === cat) ? '#6b7280' : 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: categorias.some(c => c.nombre === cat) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {getCategoriaLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorías y sus platos */}
              {categorias.length === 0 ? (
                <div className="menu-vacio">
                  <div className="menu-vacio-icono">🍽️</div>
                  <h3>Agrega categorías al menú</h3>
                  <p>Selecciona las categorías arriba para empezar a construir el menú</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {categorias.map((categoria, index) => {
                    const tipoCat = getTipoPorCategoria(categoria.nombre);
                    const platosDisponiblesCat = platosDisponibles[tipoCat] || [];
                    const platosAgregados = categoria.platos.map(p => getPlatoInfo(p.platoId)).filter(Boolean);

                    return (
                      <div key={`${categoria.nombre}-${index}`} style={{
                        background: 'white',
                        border: '2px solid #ec4899',
                        borderRadius: '1rem',
                        padding: '1.5rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.125rem', color: '#1f2937' }}>
                            {getCategoriaLabel(categoria.nombre)}
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                              ({platosAgregados.length} platos)
                            </span>
                          </h4>
                          <button
                            onClick={() => eliminarCategoria(categoria.nombre)}
                            style={{
                              padding: '0.5rem',
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Platos agregados */}
                        {platosAgregados.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              {platosAgregados.map(plato => (
                                <div key={plato._id} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.75rem',
                                  background: '#f0fdf4',
                                  borderRadius: '0.5rem',
                                  border: '1px solid #86efac'
                                }}>
                                  <div>
                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{plato.nombre}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>S/ {plato.precio.toFixed(2)}</div>
                                  </div>
                                  <button
                                    onClick={() => eliminarPlatoDeCategoria(categoria.nombre, plato._id)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: '#fee2e2',
                                      color: '#991b1b',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    Quitar
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Selector de platos disponibles */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem', fontWeight: '600' }}>
                            Agregar platos
                          </label>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                agregarPlatoACategoria(categoria.nombre, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '2px solid #d1d5db',
                              borderRadius: '0.5rem',
                              fontSize: '1rem',
                              background: 'white'
                            }}
                          >
                            <option value="">-- Selecciona un plato --</option>
                            {platosDisponiblesCat
                              .filter(p => !categoria.platos.some(cp => cp.platoId === p._id))
                              .map(plato => (
                                <option key={plato._id} value={plato._id}>
                                  {plato.nombre} - S/ {plato.precio.toFixed(2)}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Resumen del menú */}
              {totalPlatosMenu > 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#fef3c7',
                  borderRadius: '0.75rem',
                  border: '2px solid #fbbf24'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>
                        Total de platos en el menú
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>
                        {totalPlatosMenu} platos
                      </div>
                    </div>
                    {precioCompleto > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>
                          Precio menú completo
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>
                          S/ {parseFloat(precioCompleto).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Modo Vista - Vista semanal */
            <>
              {/* Controles de navegación semanal CON BOTONES DE EXPORTACIÓN */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '0.75rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <button
                  onClick={() => cambiarSemana(-1)}
                  style={{
                    padding: '0.75rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Semana anterior"
                >
                  <ChevronLeft size={20} />
                </button>

                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                    {inicioSemanaStr} - {finSemanaStr}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={irSemanaActual}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ec4899',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Semana Actual
                    </button>
                    
                    {/* BOTONES DE EXPORTACIÓN SEMANAL */}
                    <button
                      onClick={exportarSemanaPDF}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FileDown size={16} />
                      Exportar Semana PDF
                    </button>
                    
                    <button
                      onClick={exportarSemanaExcel}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FileSpreadsheet size={16} />
                      Exportar Semana Excel
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => cambiarSemana(1)}
                  style={{
                    padding: '0.75rem',
                    background: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Semana siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Grid de días de la semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
                {diasSemanales.map((dia, index) => {
                  const menusDia = getMenusPorFecha(dia);
                  const menusActivos = menusDia.filter(m => m.activo);
                  const esHoy = dia.toDateString() === new Date().toDateString();
                  const fechaStr = dia.toISOString().split('T')[0];

                  return (
                    <div 
                      key={`dia-${index}`}
                      style={{
                        background: esHoy ? '#fef3c7' : 'white',
                        border: esHoy ? '2px solid #fbbf24' : '2px solid #e5e7eb',
                        borderRadius: '1rem',
                        padding: '1rem',
                        minHeight: '200px'
                      }}
                    >
                      {/* Header del día */}
                      <div style={{ marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
                          {formatFecha(dia).split(' ')[0]}
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                          {dia.getDate()}
                        </div>
                      </div>

                      {/* BOTONES DE EXPORTACIÓN POR DÍA */}
                      {menusActivos.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                          <button
                            onClick={() => exportarDiaPDF(dia)}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              background: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                            title="Descargar menús del día en PDF"
                          >
                            <FileDown size={12} />
                            PDF
                          </button>
                          
                          <button
                            onClick={() => exportarDiaExcel(dia)}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              background: '#16a34a',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem'
                            }}
                            title="Descargar menús del día en Excel"
                          >
                            <FileSpreadsheet size={12} />
                            Excel
                          </button>
                        </div>
                      )}

                      {/* Menús del día */}
                      {menusDia.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {menusDia.map((menu) => (
                            <div 
                              key={menu._id}
                              style={{
                                background: menu.activo ? '#fdf2f8' : '#f3f4f6',
                                border: `1px solid ${menu.activo ? '#ec4899' : '#d1d5db'}`,
                                borderRadius: '0.5rem',
                                padding: '0.75rem',
                                opacity: menu.activo ? 1 : 0.6
                              }}
                            >
                              <div style={{ 
                                fontSize: '0.875rem', 
                                fontWeight: '700', 
                                color: menu.activo ? '#831843' : '#6b7280',
                                marginBottom: '0.5rem'
                              }}>
                                {menu.nombre}
                                {!menu.activo && (
                                  <span style={{ fontSize: '0.625rem', marginLeft: '0.25rem' }}>
                                    (Oculto)
                                  </span>
                                )}
                              </div>
                              
                              {menu.precioCompleto > 0 && (
                                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600', marginBottom: '0.5rem' }}>
                                  S/ {menu.precioCompleto.toFixed(2)}
                                </div>
                              )}

                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <ProtectedAction permisos={['menu.editar']}>
                                  <button
                                    onClick={() => toggleMenuActivo(menu._id)}
                                    style={{
                                      flex: 1,
                                      padding: '0.25rem',
                                      background: menu.activo ? '#fef3c7' : '#d1fae5',
                                      color: menu.activo ? '#92400e' : '#065f46',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer',
                                      fontSize: '0.625rem'
                                    }}
                                    title={menu.activo ? 'Ocultar' : 'Mostrar'}
                                  >
                                    {menu.activo ? <EyeOff size={12} /> : <Eye size={12} />}
                                  </button>
                                </ProtectedAction>

                                <ProtectedAction permisos={['menu.editar']}>
                                  <button
                                    onClick={() => editarMenu(menu)}
                                    style={{
                                      flex: 1,
                                      padding: '0.25rem',
                                      background: '#dbeafe',
                                      color: '#1e40af',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Editar"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                </ProtectedAction>

                                <ProtectedAction permisos={['menu.eliminar']}>
                                  <button
                                    onClick={() => eliminarMenu(menu._id)}
                                    style={{
                                      flex: 1,
                                      padding: '0.25rem',
                                      background: '#fee2e2',
                                      color: '#991b1b',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      cursor: 'pointer'
                                    }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </ProtectedAction>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '0.75rem' }}>
                          Sin menús
                        </div>
                      )}

                      {/* Botón agregar menú */}
                      <ProtectedAction permisos={['menu.crear']}>
                        <button
                          onClick={() => crearNuevoMenu(fechaStr)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: '#f3f4f6',
                            color: '#6b7280',
                            border: '2px dashed #d1d5db',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            marginTop: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Plus size={14} />
                          Agregar
                        </button>
                      </ProtectedAction>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}