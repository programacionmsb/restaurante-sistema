import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocketClientes = (onUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('https://restaurante-backend-a6o9.onrender.com', {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket Clientes conectado:', socketRef.current.id);
    });

    const eventos = [
      'cliente-creado',
      'cliente-actualizado',
      'cliente-eliminado'
    ];

    eventos.forEach(evento => {
      socketRef.current.on(evento, (data) => {
        console.log(`🔔 Clientes: ${evento}`, data);
        onUpdate();
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket Clientes desconectado');
      }
    };
  }, [onUpdate]);

  return socketRef;
};