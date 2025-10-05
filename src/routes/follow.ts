import express, { type Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  followUser,
  getFollowCount,
  getFollowers,
  getFollowing,
  getSuggestedFollowing,
} from "../controllers/follow.js";

const router: Router = express.Router();

router.get("/follow/followers", requireAuth, getFollowers);
router.get("/follow/following", requireAuth, getFollowing);
router.get("/follow/counter", requireAuth, getFollowCount);
router.get("/follow/suggested", requireAuth, getSuggestedFollowing);
router.patch("/follow/:id", requireAuth, followUser);

export default router;
