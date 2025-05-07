import { useEffect, useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { useAuth } from './hooks/useAuth';
import SocketClient from './lib/socket';
import './App.css';

interface UserStatus {
  userId: string;
  event: string;
  payload: {
    points?: number; 
  };
}

function App() {
  const { socket, isConnected } = useSocket();
  const { isAuthenticated, login, logout } = useAuth();
  const [token, setToken] = useState('');
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('user-status-updated', (data: UserStatus) => {
      console.log('Received user-status-updated:', data);
      setUserStatus(data);
    });

    return () => {
      socket.off('user-status-updated');
    };
  }, [socket]);

  const handleLogin = () => {
    if (token) {
      login(token);
      SocketClient.reconnect();
    }
  };

  const handleLogout = () => {
    logout();
    SocketClient.disconnect();
    setUserStatus(null);
  };


  return (
    <div className="container">
      <h1>Socket.IO Client Example</h1>
      
      {!isAuthenticated ? (
        <div className="auth-container">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your JWT token"
            className="token-input"
          />
          <button onClick={handleLogin} className="auth-button">
            Connect
          </button>
        </div>
      ) : (
        <div className="auth-container">
          <button onClick={handleLogout} className="auth-button">
            Disconnect
          </button>
        </div>
      )}

      <div className="status-container">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
        <span>Status: {isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {userStatus && (
        <div className="user-status-container">
          <h2>User Status Updates</h2>
          <div className="status-card">
            <div className="status-row">
              <span className="status-label">User ID:</span>
              <span className="status-value">{userStatus.userId}</span>
            </div>
            <div className="status-row">
              <span className="status-label">Event:</span>
              <span className="status-value">{userStatus.event}</span>
            </div>
            {userStatus.payload.points !== undefined && (
              <div className="status-row">
                <span className="status-label">Points:</span>
                <span className="status-value points">{userStatus.payload.points}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;



