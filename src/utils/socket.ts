import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:3000";

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public connect(): Socket {
    if (!this.socket) {
      const token = localStorage.getItem("authToken");
      this.socket = io(URL, {
        auth: {
          token,
        },
        transports: ["websocket"],
        withCredentials: true,
      });

      this.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketManager = SocketManager.getInstance();
