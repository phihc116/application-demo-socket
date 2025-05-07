import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth';

class SocketClient {
  private static instance: Socket | null = null;
  private static readonly SOCKET_URL = 'http://localhost:3000';
  private static readonly NAMESPACE = '/herond-points';

  public static getInstance(): Socket {
    if (!this.instance) {
      const token = AuthService.getAuthHeader();
      console.log(token);
      
      this.instance = io(this.SOCKET_URL + this.NAMESPACE, {
        autoConnect: false,
        auth: {
          Authorization: token
        }
      });

      this.instance.on('user-status-updated', (data) => {
        console.log('Received user-status-updated:', data);
      });

      this.instance.on('connect', () => {
        console.log('Connected to herond-points namespace', {
          socketId: this.instance?.id,
          connected: this.instance?.connected
        });
      });

      this.instance.on('disconnect', () => {
        console.log('Disconnected from herond-points namespace');
      });

      this.instance.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
        if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
          AuthService.removeToken();
        }
      });

      this.instance.connect();  
    }

    return this.instance;
  }

  public static disconnect() {
    if (this.instance) {
      this.instance.disconnect();
      this.instance = null;
    }
  }

  public static reconnect() {
    if (this.instance) {
      this.instance.auth = {
        Authorization: AuthService.getAuthHeader(),
      };
      this.instance.connect();
      return this.instance;
    }
    return this.getInstance();
  }
}


export default SocketClient;







