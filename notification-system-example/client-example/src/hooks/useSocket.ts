import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import SocketClient from "../lib/socket";
import { AuthService } from "../lib/auth";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = AuthService.getToken();
    if (!token) {
      console.warn("No authentication token found");
      return;
    }

    const socketInstance = SocketClient.getInstance();
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onAuthError = (error: Error) => {
      console.error("Authentication error:", error);
      setIsConnected(false);
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("auth_error", onAuthError);

    setIsConnected(socketInstance.connected);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.off("auth_error", onAuthError);
      SocketClient.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
