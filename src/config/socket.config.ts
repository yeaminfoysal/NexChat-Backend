import { ServerOptions } from 'socket.io';

export const socketConfig: Partial<ServerOptions> = {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
};
