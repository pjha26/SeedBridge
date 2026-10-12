import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.userId); // private room per user
    socket.on('disconnect', () => {});
  });

  return io;
}

export function getIo() {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}

export function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(userId.toString()).emit(event, data);
}
