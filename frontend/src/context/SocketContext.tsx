import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectSocket: () => Promise<Socket | null>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectSocket: async () => null,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  // Lazy Socket.IO Connection Handler
  const connectSocket = useCallback(async (): Promise<Socket | null> => {
    if (socketRef.current) {
      return socketRef.current;
    }
    if (isConnectingRef.current) {
      return null;
    }

    isConnectingRef.current = true;

    try {
      // Dynamic import of socket.io-client for code-splitting & performance optimization
      const { io } = await import('socket.io-client');

      const serverUrl = window.location.origin.includes('localhost')
        ? 'http://localhost:5000'
        : '/';

      const socketInstance = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketInstance.on('connect', () => {
        console.log('[Socket.IO Lazy Client] Real-time websocket connected:', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('[Socket.IO Lazy Client] Real-time websocket disconnected');
        setIsConnected(false);
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);
      isConnectingRef.current = false;
      return socketInstance;
    } catch (err) {
      console.warn('[Socket.IO Lazy Client] Dynamic connection error:', err);
      isConnectingRef.current = false;
      return null;
    }
  }, []);

  // Deferred Lazy Load on Browser Idle
  useEffect(() => {
    let idleTimer: any = null;

    const scheduleLazyConnection = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          connectSocket();
        }, { timeout: 3000 });
      } else {
        idleTimer = setTimeout(() => {
          connectSocket();
        }, 1500);
      }
    };

    scheduleLazyConnection();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

