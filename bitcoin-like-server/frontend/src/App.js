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
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center font-comic">
      <h1 className="text-4xl text-yellow-600 font-bold mb-8 text-shadow-comic">Simple Bitcoin-like Wallet</h1>
      {!wallet ? (
        <button onClick={createWallet} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-yellow-300 transition-transform transform hover:scale-110">
          Create Wallet
        </button>
      ) : (
        <div className="text-center mb-8 p-4 bg-white shadow-lg rounded-lg comic-border">
          <p className="text-sm text-gray-800"><strong>Public Key:</strong> {wallet.publicKey}</p>
          <p className="text-sm text-gray-800 mt-2"><strong>Private Key:</strong> {wallet.privateKey}</p>
        </div>
      )}
      <h2 className="text-2xl text-blue-600 font-bold mb-4 text-shadow-comic">Send Transaction</h2>
      <input
        type="text"
        name="toAddress"
        placeholder="To Address"
        value={transaction.toAddress}
        onChange={handleTransactionChange}
        className="mb-2 p-2 w-full max-w-sm rounded-lg border-2 border-yellow-400 comic-border focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={transaction.amount}
        onChange={handleTransactionChange}
        className="mb-4 p-2 w-full max-w-sm rounded-lg border-2 border-yellow-400 comic-border focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button onClick={signAndSendTransaction} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-400 transition-transform transform hover:scale-110">
        Sign and Send Transaction
      </button>
    </div>
  );
}

export default App;
