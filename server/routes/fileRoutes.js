import express from "express";

import validation from "../middleware/validateIdMiddleware.js";
import { creatingFile, deletingFile, readingFile, updatingFile } from "../controllers/fileRouteController.js";

const router = express.Router();

router.param("parentDirId", validation);
router.param("id", validation);


// Create
router.post("/:parentDirId?",creatingFile )

// Read
router.get("/:id", readingFile);

// Update
router.patch("/:id", updatingFile);

// Delete
router.delete("/:id",deletingFile);

export default router;
