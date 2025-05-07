const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log(`Received: ${message}`);
    ws.send(`Server received: ${message}`);
  });

  ws.send('Hello from server!');
});

console.log('WebSocket server running on ws://localhost:3000');
