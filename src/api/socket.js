import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5050/api";
const socketUrl = import.meta.env.VITE_SOCKET_URL ?? apiUrl.replace(/\/api\/?$/, "");

let dashboardSocket = null;
let dashboardSocketToken = null;

export function getDashboardSocket(token) {
  if (dashboardSocket && dashboardSocketToken === token) {
    return dashboardSocket;
  }

  dashboardSocket?.disconnect();
  dashboardSocketToken = token;
  dashboardSocket = io(socketUrl, {
    auth: { token },
    transports: ["websocket", "polling"]
  });

  return dashboardSocket;
}

export function disconnectDashboardSocket() {
  dashboardSocket?.disconnect();
  dashboardSocket = null;
  dashboardSocketToken = null;
}
