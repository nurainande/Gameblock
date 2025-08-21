import express from "express";
import bcryptjs from "bcryptjs";
import { User } from "../model/userModel.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { checkExclusion, checkLoggedInUser, getAllUsers, logout, requestBlock, signin, signup, verifyNin } from "../controllers/userController.js";
import { isPartner } from "../middleware/isPartner.js";

const router = express.Router();

router.post('/signup',signup);
router.post('/signin', signin);
router.post('/logout', logout);
router.get('/check-logged-in-user', verifyToken, checkLoggedInUser);
router.post('/verify-nin', verifyToken,verifyNin )
router.post('/block', verifyToken, requestBlock)
router.post('/check-user', verifyToken,checkExclusion)

router.get('/admin', verifyToken, isAdmin, getAllUsers);






export default router;