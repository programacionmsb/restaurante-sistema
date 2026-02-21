import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocketCocina = (onUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('https://restaurante-backend-a6o9.onrender.com', {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket Cocina conectado:', socketRef.current.id);
    });

    const eventos = [
      'pedido-creado',
      'pedido-actualizado',
      'pedido-pagado',
      'pedido-cancelado'
    ];

    eventos.forEach(evento => {
      socketRef.current.on(evento, (pedido) => {
        console.log(`🔔 Cocina: ${evento}`, pedido);
        onUpdate();
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket Cocina desconectado');
      }
    };
  }, [onUpdate]);

  return socketRef;
};