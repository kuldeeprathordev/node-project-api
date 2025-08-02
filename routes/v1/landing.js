import { Router } from "express";
import tokenAuth from '../../app/middlewares/authorization.js';
import {
    index,
    store,
    update,
    destroy,
    upload

} from "../../app/controllers/v1/LandingController.js";

const router = Router();

// AWS routes
router.get("/landing-details", tokenAuth, index);
router.post("/landing-store", tokenAuth, store);
router.patch("/landing-update/:id", tokenAuth, update);
router.delete("/landing-delete/:id", tokenAuth, destroy);
router.post("/upload-image", upload);

export default router;
