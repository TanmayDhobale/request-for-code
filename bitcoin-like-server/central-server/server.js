const WebSocket = require('ws');
const crypto = require('crypto');

const PORT = 8080;
const server = new WebSocket.Server({ port: PORT });

const miners = new Set();
let blockchain = [];

server.on('connection', (ws) => {
  miners.add(ws);
  console.log('New miner connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch(data.type) {
      case 'NEW_BLOCK':
        if (verifyBlock(data.block)) {
          blockchain.push(data.block);
          broadcastToMiners(message);
        }
        break;
      case 'NEW_TRANSACTION':
        broadcastToMiners(message);
        break;
      case 'REQUEST_BLOCKCHAIN':
        ws.send(JSON.stringify({ type: 'BLOCKCHAIN', chain: blockchain }));
        break;
    }
  });

  ws.on('close', () => {
    miners.delete(ws);
    console.log('Miner disconnected');
  });
});

function broadcastToMiners(message) {
  miners.forEach((miner) => {
    if (miner.readyState === WebSocket.OPEN) {
      miner.send(message);
    }
  });
}

function verifyBlock(block) {
  //  block verification logic here ill add later
  // This is a placeholder and should be replaced with actual verification  ill add later
  return true;
}

console.log(`Central server running on ws://localhost:${PORT}`);
