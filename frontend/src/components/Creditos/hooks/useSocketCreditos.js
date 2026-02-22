import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocketCreditos = (onUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('https://restaurante-backend-a6o9.onrender.com', {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket Créditos conectado:', socketRef.current.id);
    });

    const eventos = [
      'credito-creado',
      'credito-cobrado',
      'pedido-actualizado'
    ];

    eventos.forEach(evento => {
      socketRef.current.on(evento, (data) => {
        console.log(`🔔 Créditos: ${evento}`, data);
        onUpdate();
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket Créditos desconectado');
      }
    };
  }, [onUpdate]);

  return socketRef;
};