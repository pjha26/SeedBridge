import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getToken } from '../api/client';

// Minimal Socket interface — matches what this app uses from socket.io-client.
// The full type is provided once socket.io-client is installed.
export interface AppSocket {
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
  disconnect(): void;
}

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

    // Dynamic import so the module is resolved at runtime (after npm install).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import('socket.io-client' as any).then((mod: any) => {
      const io = mod.io ?? mod.default;
      const s: AppSocket = io({ auth: { token }, transports: ['websocket'] });
      (s as unknown as { on: AppSocket['on'] }).on('connect', () => setConnected(true));
      (s as unknown as { on: AppSocket['on'] }).on('disconnect', () => setConnected(false));
      socketRef.current = s;
    }).catch(() => {
      // socket.io-client not installed yet; notifications disabled.
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return (
    <Ctx.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </Ctx.Provider>
  );
}
