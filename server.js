/**
 * @class       : server
 * @author      : nkthanh (nguyenkhacthanh244@gmail.com)
 * @created     : Friday Jan 24, 2020 02:57:25 +07
 * @description : server
 */

const SocketIO = require('socket.io');
const nodeStatic = require('node-static');
const http = require('http');


const fileServer = new (nodeStatic.Server)();
const server = http.createServer((req, res) => {
  fileServer.serve(req, res, ()=> {
    console.log('Serve static file');
  });
});
const io = SocketIO(server);


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});


io.on('connect', socket => {
  socket.broadcast.emit('new peer', {
    from: socket.id
  });

  socket.on('candidate', message => {
    socket.broadcast.to(message.to).emit('candidate', {
      from: socket.id,
      candidate: message.candidate
    });
  });

  socket.on('offer', message => {
    socket.broadcast.to(message.to).emit('offer', {
      from: socket.id,
      offer: message.offer
    });
  });

  socket.on('answer', message => {
    socket.broadcast.to(message.to).emit('answer', {
      from: socket.id,
      answer: message.answer
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('peer left', {
      peerId: socket.id
    });
  });
});

