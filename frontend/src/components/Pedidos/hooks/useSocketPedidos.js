import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useSocketPedidos = (onUpdate, modalOpen) => {
  const socketRef = useRef(null);
  const [actualizacionesPendientes, setActualizacionesPendientes] = useState(false);

  useEffect(() => {
    socketRef.current = io('https://restaurante-backend-a6o9.onrender.com', {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket conectado:', socketRef.current.id);
    });

    const eventos = [
      'pedido-creado',
      'pedido-actualizado',
      'pedido-pagado',
      'pedido-cancelado',
      'credito-creado'
    ];

    eventos.forEach(evento => {
      socketRef.current.on(evento, (pedido) => {
        console.log(`🔔 ${evento}:`, pedido);
        
        if (!modalOpen) {
          // Modal cerrado: actualizar inmediatamente
          onUpdate();
          setActualizacionesPendientes(false);
        } else {
          // Modal abierto: marcar como pendiente
          console.log('⏸️ Modal abierto, actualización en pausa');
          setActualizacionesPendientes(true);
        }
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket desconectado');
      }
    };
  }, [onUpdate, modalOpen]);

  // Limpiar pendientes cuando se cierra el modal
  useEffect(() => {
    if (!modalOpen && actualizacionesPendientes) {
      console.log('🔄 Modal cerrado, aplicando actualizaciones pendientes');
      onUpdate();
      setActualizacionesPendientes(false);
    }
  }, [modalOpen, actualizacionesPendientes, onUpdate]);

  return { socketRef, actualizacionesPendientes };
};