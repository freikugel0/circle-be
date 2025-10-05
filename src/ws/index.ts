import { parse } from "url";
import WebSocket, { WebSocketServer } from "ws";
import { AppError } from "../middlewares/error.js";
import RESPONSE_CODES from "../constants/responseCodes.js";
import { verifyJWT } from "../utils/auth.js";
import type { JwtUser } from "../middlewares/auth.js";

export const clients = new Map<number, Set<WebSocket>>();

export const setupWebsocket = (server: any) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const { query } = parse(req.url!, true);
    const token = query.token as string | undefined;

    try {
      if (!token) {
        throw new AppError(
          401,
          RESPONSE_CODES.AUTH.TOKEN_MISSING,
          "No token provided",
        );
      }

      const payload = verifyJWT<JwtUser>(token);
      const userId = payload.id;

      if (!clients.has(userId)) {
        clients.set(userId, new Set());
      }
      clients.get(userId)!.add(ws);

      console.log(`User ${userId} connected`);

      ws.on("close", () => {
        clients.get(userId)?.delete(ws);
        if (clients.get(userId)?.size === 0) {
          clients.delete(userId);
        }
        console.log(`User ${userId} disconnected`);
      });
    } catch {
      ws.close(4001, "Unauthorized");
    }
  });
};
