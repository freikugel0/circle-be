import express, { type Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  deleteNotification,
  deleteNotifications,
  getNotifications,
  readNotification,
  readNotifications,
} from "../controllers/notification.js";

const router: Router = express.Router();

router.get("/notifications", requireAuth, getNotifications);
router.patch("/notifications", requireAuth, readNotifications);
router.patch("/notifications/:id", requireAuth, readNotification);
router.delete("/notifications", requireAuth, deleteNotifications);
router.delete("/notifications/:id", requireAuth, deleteNotification);

export default router;
