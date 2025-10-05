import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import limiter from "./middlewares/limiter.js";
import {
  multerErrorHandler,
  notFound,
  serverError,
} from "./middlewares/error.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import threadRoutes from "./routes/thread.js";
import replyRoutes from "./routes/reply.js";
import notificationRoutes from "./routes/notification.js";
import followRoutes from "./routes/follow.js";
import { createServer } from "http";
import { setupWebsocket } from "./ws/index.js";

const app = express();
const server = createServer(app);
const port = process.env.PORT;

app.use(
  cors({
    origin: ["http://localhost:4321"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(limiter);
app.use(express.json());

// Endpoints
app.use("/api/v1/images", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", threadRoutes);
app.use("/api/v1", replyRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", followRoutes);

// Error handlers
app.use(notFound);
app.use(multerErrorHandler);
app.use(serverError);

// Websocket Instance
setupWebsocket(server);

server.listen(port, () => {
  console.log(`Started on :${port}`);
});
