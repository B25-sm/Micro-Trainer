/**
 * WebSocket Hook for Real-Time Updates
 * 
 * Manages Socket.io connection and event handling
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:5000';

export function useWebSocket(studentId, role = 'student') {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef({});

  useEffect(() => {
    if (!studentId) return;

    // Create socket connection
    const newSocket = io(BACKEND_URL, {
      auth: {
        studentId,
        role
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    // Heartbeat
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 30000); // Every 30 seconds

    setSocket(newSocket);

    // Cleanup
    return () => {
      clearInterval(pingInterval);
      newSocket.close();
    };
  }, [studentId, role]);

  // Subscribe to event
  const on = useCallback((eventName, handler) => {
    if (!socket) return;

    socket.on(eventName, handler);
    handlersRef.current[eventName] = handler;

    // Return unsubscribe function
    return () => {
      socket.off(eventName, handler);
      delete handlersRef.current[eventName];
    };
  }, [socket]);

  // Emit event
  const emit = useCallback((eventName, data) => {
    if (!socket || !connected) {
      console.warn('Socket not connected, cannot emit event');
      return;
    }

    socket.emit(eventName, data);
  }, [socket, connected]);

  return {
    socket,
    connected,
    on,
    emit
  };
}
