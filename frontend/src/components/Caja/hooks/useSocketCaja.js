import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocketCaja = (onUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('https://restaurante-backend-a6o9.onrender.com', {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket Caja conectado:', socketRef.current.id);
    });

    const eventos = [
      'pedido-creado',
      'pedido-actualizado',
      'pedido-pagado',
      'credito-creado',
      'credito-cobrado'
    ];

    eventos.forEach(evento => {
      socketRef.current.on(evento, (data) => {
        console.log(`🔔 Caja: ${evento}`, data);
        onUpdate();
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket Caja desconectado');
      }
    };
  }, [onUpdate]);

  return socketRef;
};