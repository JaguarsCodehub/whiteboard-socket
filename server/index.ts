import { Socket } from 'socket.io';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.get('/health', async (_, res) => {
  res.send('Healthy');
});

io.on('connection', (socket: Socket) => {
  console.log('connection');

  socket.on('draw', (moves: unknown, options: unknown) => {
    console.log('drawing');
    socket.emit('socket_draw', moves, options);
  });

  socket.on('disconnect', () => {
    console.log('Client Disconnected');
  });
});

server.listen(3001, () => {
  console.log('server running at http://localhost:3001');
});
