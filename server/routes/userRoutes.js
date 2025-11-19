import express from "express";
import auth from "../middleware/auth.js";

import { gettingUser, loginWithGoogle, logoutUser, userLogin, userRegister } from "../controllers/userController.js";

const router = express.Router();

// Sign Up
router.post("/register", userRegister);

//Login
router.post("/login", userLogin);

router.get(`/`, auth, gettingUser);

router.post(`/logout`,logoutUser);
router.post('/google',loginWithGoogle)

export default router;
