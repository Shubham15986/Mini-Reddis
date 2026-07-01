// src/web-proxy.js
const express = require('express');
const { WebSocketServer } = require('ws');
const net = require('net');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(3000, () => {
  console.log('Web interface running at http://localhost:3000');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  // Every time a browser connects, open a dedicated TCP socket to Mini Redis
  const tcpClient = new net.Socket();
  
  tcpClient.connect(6380, '127.0.0.1', () => {
    ws.send('Connected to Mini Redis Web Terminal...');
  });

  // Forward data from TCP to Browser
  tcpClient.on('data', (data) => {
    // Clean up the raw string to remove the terminal prompt (">") 
    // so our web UI can handle formatting cleanly
    let response = data.toString().replace(/> /g, '').trim();
    if (response) ws.send(response);
  });

  // Forward data from Browser to TCP
  ws.on('message', (message) => {
    tcpClient.write(message.toString() + '\n');
  });

  tcpClient.on('error', () => ws.send('(error) Lost connection to core server'));
  ws.on('close', () => tcpClient.destroy());
});
