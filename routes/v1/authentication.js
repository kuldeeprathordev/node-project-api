import { Router } from "express";
import tokenAuth from '../../app/middlewares/authorization.js';
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  changePassword,
  checkResetToken,
  refreshToken,
  logout
} from "../../app/controllers/v1/AuthController.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgotPassword);
router.post("/check-reset-token", checkResetToken);
router.post('/reset-password', resetPassword);
router.patch('/change-password', tokenAuth, changePassword);
router.get('/refresh-token', tokenAuth, refreshToken);
router.delete('/logout', tokenAuth, logout);

export default router;
