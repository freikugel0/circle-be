import express, { type Router } from "express";
import {
  login,
  register,
  resetPassword,
  resetPasswordRequest,
} from "../controllers/auth.js";

const router: Router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/reset-password-request", resetPasswordRequest);
router.post("/auth/reset-password", resetPassword);

export default router;
