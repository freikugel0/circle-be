import express, { type Router } from "express";
import { editMe, getMe, getUsers } from "../controllers/user.js";
import { requireAuth } from "../middlewares/auth.js";
import uploadImage from "../middlewares/file.js";
import { getThreads } from "../controllers/thread.js";

const router: Router = express.Router();

router.get("/me", requireAuth, getMe);
router.post(
  "/me/edit",
  requireAuth,
  uploadImage.fields([
    { name: "photo_profile", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  editMe,
);

router.get("/users", requireAuth, getUsers);
router.get("/users/:userId/threads", requireAuth, getThreads);

export default router;
