import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocketPedidos = (onUpdate) => {
  const socketRef = useRef(null);

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
        onUpdate();
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket desconectado');
      }
    };
  }, [onUpdate]);

  return socketRef;
};