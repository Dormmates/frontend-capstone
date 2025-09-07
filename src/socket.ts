import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }

  if (!socket.connected) {
    socket.connect();
    socket.once("connect", () => {
      socket?.emit("auth", userId);
    });
  } else {
    socket.emit("auth", userId);
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    console.log("Socket disconnected");
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};
