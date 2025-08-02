import { Router } from "express";
import tokenAuth from '../../app/middlewares/adminAuthorization.js';
import {
    index,
    store,
    show,
    update,
    destroy,
    changeStatus,
} from "../../app/controllers/v1/ContentController.js";
const router = Router();
router.get("/contents",tokenAuth, index);
router.post("/content-store",tokenAuth, store);
router.patch("/content-update/:slug",tokenAuth, update);
router.delete("/content-delete/:slug",tokenAuth, destroy);
router.patch("/change-content-status/:slug",tokenAuth, changeStatus);
router.get("/content-show/:slug", tokenAuth, show);
export default router;
