/**
 * @deprecated
 * Execution routes are disabled in NoBrain v2.
 * All endpoints return 410 Gone for backward compatibility.
 */

import express from "express";
import ApiResponse from "../utils/ApiResponse.js";

const router = express.Router();

const deprecatedHandler = (req, res) => {
  return res.status(410).json(
    new ApiResponse(410, null, "Execution logs deprecated in NoBrain v2. NoBrain now focuses on workflow planning & explanation.")
  );
};

// 🔴 All execution routes deprecated — return 410 Gone
router.post("/", deprecatedHandler);
router.get("/", deprecatedHandler);
router.get("/workflow/:workflowId", deprecatedHandler);
router.put("/:runId", deprecatedHandler);
router.delete("/:runId", deprecatedHandler);
router.get("/:runId", deprecatedHandler);

export default router;
