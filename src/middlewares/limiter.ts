import rateLimit from "express-rate-limit";
import { AppError } from "./error.js";
import RESPONSE_CODES from "../constants/responseCodes.js";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  handler: () => {
    throw new AppError(
      429,
      RESPONSE_CODES.API.LIMIT_EXCEEDED,
      "Request limit exceeded, try again later",
    );
  },
});

export default limiter;
