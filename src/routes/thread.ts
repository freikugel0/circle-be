import express, { type Router } from "express";
import {
  createThread,
  getThreadDetails,
  getThreads,
} from "../controllers/thread.js";
import uploadImage from "../middlewares/file.js";
import { requireAuth } from "../middlewares/auth.js";
import { likeThreadOrReply } from "../controllers/like.js";
import { createThreadReply, getThreadReplies } from "../controllers/reply.js";

const router: Router = express.Router();

router.get("/threads", requireAuth, getThreads);
router.get("/threads/:id", requireAuth, getThreadDetails);
router.post("/threads", requireAuth, uploadImage.single("file"), createThread);

router.get("/threads/:id/replies", requireAuth, getThreadReplies);
router.patch("/threads/:threadId/like", requireAuth, likeThreadOrReply);
router.post(
  "/threads/:id/reply",
  requireAuth,
  uploadImage.single("file"),
  createThreadReply,
);

export default router;
