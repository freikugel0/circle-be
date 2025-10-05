import express, { type Router } from "express";
import { deleteReply } from "../controllers/reply.js";
import { requireAuth } from "../middlewares/auth.js";
import { likeThreadOrReply } from "../controllers/like.js";

const router: Router = express.Router();

router.patch("/replies/:replyId/like", requireAuth, likeThreadOrReply);
router.delete("/replies/:id", requireAuth, deleteReply);

export default router;
