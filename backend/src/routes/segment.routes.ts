import { Router } from "express";

import {
  createSegment,
  deleteSegment,
  getSegmentAudience,
  getSegments,
} from "../controllers/segments.controller.js";

const router = Router();

router.get("/", getSegments);

router.post("/", createSegment);

router.get(
  "/:id/audience",
  getSegmentAudience
);

router.delete(
  "/:id",
  deleteSegment
);

export default router;