import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getToken } from '../api/client';

export type AppSocket = Socket;

interface SocketCtx {
  socket: AppSocket | null;
  connected: boolean;
}

const Ctx = createContext<SocketCtx>({ socket: null, connected: false });

export function useSocket(): SocketCtx {
  return useContext(Ctx);
}

export function SocketProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string | null;
}) {
  const socketRef = useRef<AppSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }
    const token = getToken();
    if (!token) return;

    const s = io({ auth: { token }, transports: ['websocket'] });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    socketRef.current = s;

    return () => {
      s.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [userId]);

  return (
    <Ctx.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </Ctx.Provider>
  );
}
