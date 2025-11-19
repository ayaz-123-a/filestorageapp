import express from "express";

import validation from "../middleware/validateIdMiddleware.js";
import {creatingDir, deleteDir, fetchingDir, updatingDir} from '../controllers/directoryRouteController.js'

const router = express.Router();


router.param("parentDirId",validation );
router.param("id", validation);


// Read
router.get("/:id?", fetchingDir);

router.post("/:parentDirId?",creatingDir)

router.patch("/:id", updatingDir );

router.delete("/:id", deleteDir);
export default router;
