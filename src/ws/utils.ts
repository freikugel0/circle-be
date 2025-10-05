import { clients } from "./index.js";

export const sendToUser = (userId: number, message: any) => {
  const userClients = clients.get(userId);
  if (!userClients) return;

  const data = JSON.stringify(message);
  userClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
