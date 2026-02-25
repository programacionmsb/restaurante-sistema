import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DIAS_SEMANA, MESES, CATEGORIA_LABELS_PDF, getMenusPorFecha, getDiasSemanales, getFinSemana, formatFecha } from '../utils/menuHelpers';

export const useMenuExport = (semanaActual, menus) => {
  const diasSemanales = getDiasSemanales(semanaActual);
  const inicioSemanaStr = formatFecha(semanaActual);
  const finSemanaStr = formatFecha(getFinSemana(semanaActual));

  // ========== PDF DÍA ==========

  const exportarDiaPDF = (dia) => {
    const menusDia = getMenusPorFecha(menus, dia).filter(m => m.activo);
    if (menusDia.length === 0) return alert('No hay menús activos para este día');

    const doc = new jsPDF();
    const fecha = new Date(dia);
    const fechaTexto = `${DIAS_SEMANA[fecha.getDay()]}, ${fecha.getDate()} de ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;

    // Fondo
    doc.setFillColor(70, 48, 33);
    doc.rect(0, 0, 210, 297, 'F');

    // Header
    doc.setFillColor(139, 69, 19);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setFillColor(205, 127, 50);
    doc.circle(30, 25, 12, 'F');
    doc.circle(180, 25, 12, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('🍴', 25, 28);
    doc.text('🍴', 175, 28);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('Menú del Día', 105, 30, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(fechaTexto, 105, 42, { align: 'center' });

    let yPos = 65;

    menusDia.forEach((menu, menuIndex) => {
      if (menuIndex > 0) {
        yPos += 10;
        doc.setDrawColor(205, 127, 50);
        doc.setLineWidth(0.5);
        doc.line(30, yPos - 5, 180, yPos - 5);
        yPos += 5;
      }

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 215, 0);
      doc.text(menu.nombre, 105, yPos, { align: 'center' });
      yPos += 8;

      if (menu.descripcion) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(220, 220, 220);
        doc.text(menu.descripcion, 105, yPos, { align: 'center', maxWidth: 150 });
        yPos += 8;
      }

      menu.categorias.forEach(categoria => {
        doc.setFillColor(205, 127, 50);
        doc.roundedRect(35, yPos - 2, 140, 10, 3, 3, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(CATEGORIA_LABELS_PDF[categoria.nombre] || categoria.nombre.toUpperCase(), 105, yPos + 6, { align: 'center' });
        yPos += 15;

        categoria.platos.forEach(plato => {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(205, 127, 50);
          doc.circle(42, yPos - 1, 1.5, 'F');
          doc.text(plato.nombre, 48, yPos);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(144, 238, 144);
          doc.text(`S/ ${plato.precio.toFixed(2)}`, 168, yPos);
          yPos += 7;
        });

        yPos += 3;
      });

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

    // Footer
    const footerY = 270;
    doc.setFillColor(139, 69, 19);
    doc.rect(0, footerY, 210, 27, 'F');
    doc.setFillColor(205, 127, 50);
    doc.circle(25, footerY + 13, 8, 'F');
    doc.circle(185, footerY + 13, 8, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('🍽️', 21, footerY + 16);
    doc.text('☕', 181, footerY + 16);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text('Realiza tu pedido:', 105, footerY + 10, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text('📞 +51 931 870 297', 105, footerY + 20, { align: 'center' });

    const nombreArchivo = `menu-${DIAS_SEMANA[fecha.getDay()]}-${fecha.getDate()}-${MESES[fecha.getMonth()]}.pdf`;
    doc.save(nombreArchivo);
  };

  // ========== EXCEL DÍA ==========

  const exportarDiaExcel = (dia) => {
    const menusDia = getMenusPorFecha(menus, dia).filter(m => m.activo);
    if (menusDia.length === 0) return alert('No hay menús activos para este día');

    const fecha = new Date(dia);
    const data = [];

    data.push(['MENÚ DEL DÍA']);
    data.push([`${DIAS_SEMANA[fecha.getDay()]}, ${fecha.getDate()} de ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`]);
    data.push([]);

    menusDia.forEach((menu, index) => {
      if (index > 0) { data.push([]); data.push(['-----------------------------------']); data.push([]); }
      data.push([menu.nombre]);
      if (menu.descripcion) data.push([menu.descripcion]);
      data.push([]);
      menu.categorias.forEach(cat => {
        data.push([cat.nombre.toUpperCase()]);
        cat.platos.forEach(p => data.push(['', p.nombre, `S/ ${p.precio.toFixed(2)}`]));
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
    ws['!cols'] = [{ wch: 20 }, { wch: 40 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menú del Día');
    XLSX.writeFile(wb, `menu-${DIAS_SEMANA[fecha.getDay()]}-${fecha.getDate()}-${MESES[fecha.getMonth()]}.xlsx`);
  };

  // ========== PDF SEMANA ==========

  const exportarSemanaPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, 210, 297, 'F');
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
      const menusDia = getMenusPorFecha(menus, dia).filter(m => m.activo);
      if (menusDia.length === 0) return;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(236, 72, 153);
      doc.roundedRect(15, yPos, 180, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`${DIAS_SEMANA[dia.getDay()]} ${dia.getDate()}`, 20, yPos + 8);
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

        menu.categorias.forEach(cat => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 100);
          doc.text(cat.nombre + ':', 25, yPos);
          yPos += 5;
          cat.platos.forEach(p => {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(`  • ${p.nombre}`, 30, yPos);
            yPos += 4;
          });
          yPos += 2;
        });

        yPos += 5;
      });

      yPos += 3;
      if (yPos > 250 && index < diasSemanales.length - 1) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save(`menus-semana-${semanaActual.toISOString().split('T')[0]}.pdf`);
  };

  // ========== EXCEL SEMANA ==========

  const exportarSemanaExcel = () => {
    const data = [];
    data.push(['MENÚS DE LA SEMANA']);
    data.push([`${inicioSemanaStr} - ${finSemanaStr}`]);
    data.push([]);

    diasSemanales.forEach(dia => {
      const menusDia = getMenusPorFecha(menus, dia).filter(m => m.activo);
      if (menusDia.length === 0) return;

      data.push([`${DIAS_SEMANA[dia.getDay()]} ${dia.getDate()}`]);
      menusDia.forEach(menu => {
        data.push(['', menu.nombre, menu.precioCompleto > 0 ? `S/ ${menu.precioCompleto.toFixed(2)}` : '']);
        menu.categorias.forEach(cat => {
          data.push(['', '', cat.nombre]);
          cat.platos.forEach(p => data.push(['', '', '', p.nombre, `S/ ${p.precio.toFixed(2)}`]));
        });
        data.push([]);
      });
      data.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Semana');
    XLSX.writeFile(wb, `menus-semana-${semanaActual.toISOString().split('T')[0]}.xlsx`);
  };

  return {
    exportarDiaPDF,
    exportarDiaExcel,
    exportarSemanaPDF,
    exportarSemanaExcel,
    diasSemanales,
    inicioSemanaStr,
    finSemanaStr,
  };
};
