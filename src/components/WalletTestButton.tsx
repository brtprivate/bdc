import React from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';

const WalletTestButton: React.FC = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    console.log('🔗 Test: Opening Web3Modal...');
    try {
      open();
    } catch (error) {
      console.error('❌ Test: Error opening Web3Modal:', error);
    }
  };

  const handleDisconnect = () => {
    console.log('🔌 Test: Disconnecting wallet...');
    disconnect();
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 10000,
      background: '#333',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px'
    }}>
      <div>
        <strong>Wallet Test</strong>
      </div>
      <div>
        Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}
      </div>
      {address && (
        <div>
          Address: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}
      <div style={{ marginTop: '8px' }}>
        {!isConnected ? (
          <button 
            onClick={handleConnect}
            style={{
              background: '#FFA000',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔗 Test Connect
          </button>
        ) : (
          <button 
            onClick={handleDisconnect}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔌 Disconnect
          </button>
        )}
      </div>
    </div>
  );
};

export default WalletTestButton;
