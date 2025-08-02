import { Router } from "express";
import tokenAuth from '../../app/middlewares/adminAuthorization.js';

import {
    index,
    store,
    changeStatus,
    changePassword,
    destroy,
    getEnvVariables
} from "../../app/controllers/v1/UserController.js";
const router = Router();
router.get("/users",tokenAuth, index);
router.post("/user-store",tokenAuth, store);
router.patch("/change-status/:username",tokenAuth, changeStatus);
router.delete("/user-delete/:id",tokenAuth, destroy);
router.patch("/change-password/:username",tokenAuth, changePassword);
router.get("/env", getEnvVariables);

export default router;
