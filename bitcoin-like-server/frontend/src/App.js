import React, { useState } from 'react';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

function App() {
  const [wallet, setWallet] = useState(null);
  const [transaction, setTransaction] = useState({ toAddress: '', amount: '' });
  const [minerServerUrl, setMinerServerUrl] = useState('http://localhost:3000');

  const createWallet = () => {
    const keyPair = ec.genKeyPair();
    setWallet({
      privateKey: keyPair.getPrivate('hex'),
      publicKey: keyPair.getPublic('hex')
    });
  };

  const handleTransactionChange = (e) => {
    setTransaction({ ...transaction, [e.target.name]: e.target.value });
  };

  const signAndSendTransaction = async () => {
    if (!wallet) {
      alert('Please create a wallet first');
      return;
    }

    const keyPair = ec.keyFromPrivate(wallet.privateKey);
    const txObject = {
      fromAddress: wallet.publicKey,
      toAddress: transaction.toAddress,
      amount: parseFloat(transaction.amount)
    };

    const txHash = calculateTransactionHash(txObject);
    const signature = keyPair.sign(txHash).toDER('hex');

    const signedTransaction = {
      ...txObject,
      signature
    };

    try {
      const response = await fetch(`${minerServerUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signedTransaction)
      });

      if (response.ok) {
        alert('Transaction sent successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to send transaction: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Error sending transaction');
    }
  };

  const calculateTransactionHash = (tx) => {
    // This is a simplified hash function. In a real application, use a proper cryptographic hash function.
    return JSON.stringify(tx);
  };

  return (
    <div>
      <h1>Simple Bitcoin-like Wallet</h1>
      {!wallet ? (
        <button onClick={createWallet}>Create Wallet</button>
      ) : (
        <div>
          <p>Public Key: {wallet.publicKey}</p>
          <p>Private Key: {wallet.privateKey}</p>
        </div>
      )}
      <h2>Send Transaction</h2>
      <input
        type="text"
        name="toAddress"
        placeholder="To Address"
        value={transaction.toAddress}
        onChange={handleTransactionChange}
      />
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={transaction.amount}
        onChange={handleTransactionChange}
      />
      <button onClick={signAndSendTransaction}>Sign and Send Transaction</button>
    </div>
  );
}

export default App;
