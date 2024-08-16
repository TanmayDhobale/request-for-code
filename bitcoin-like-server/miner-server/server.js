const WebSocket = require('ws');
const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain } = require('./blockchain');
const { Transaction } = require('./transaction');

const CENTRAL_SERVER = 'ws://localhost:8080';
const HTTP_PORT = 3000;

const ws = new WebSocket(CENTRAL_SERVER);
const blockchain = new Blockchain();

ws.on('open', () => {
  console.log('Connected to central server');
  ws.send(JSON.stringify({ type: 'REQUEST_BLOCKCHAIN' }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);

  switch(message.type) {
    case 'BLOCKCHAIN':
      blockchain.chain = message.chain;
      console.log('Received blockchain from central server');
      break;
    case 'NEW_TRANSACTION':
      blockchain.addTransaction(message.transaction);
      console.log('Added new transaction to pending transactions');
      break;
    case 'NEW_BLOCK':
      if (blockchain.addBlock(message.block)) {
        console.log('Added new block to blockchain');
      } else {
        console.log('Rejected invalid block');
      }
      break;
  }
});

function mineBlock() {
  const newBlock = blockchain.minePendingTransactions(minerAddress);
  ws.send(JSON.stringify({ type: 'NEW_BLOCK', block: newBlock }));
}

// Start mining
setInterval(mineBlock, 10000);

// HTTP server for receiving transactions from frontend
const app = express();
app.use(bodyParser.json());

app.post('/transaction', (req, res) => {
  const { fromAddress, toAddress, amount, signature } = req.body;
  const transaction = new Transaction(fromAddress, toAddress, amount);
  transaction.signature = signature;

  try {
    blockchain.addTransaction(transaction);
    ws.send(JSON.stringify({ type: 'NEW_TRANSACTION', transaction }));
    res.status(200).json({ message: 'Transaction added successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(HTTP_PORT, () => console.log(`Miner server running on http://localhost:${HTTP_PORT}`));
