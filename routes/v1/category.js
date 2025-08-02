import { Router } from "express";
import tokenAuth from '../../app/middlewares/adminAuthorization.js';

import {
    index,
    store,
    update,
    destroy,
    changeStatus

} from "../../app/controllers/v1/CategoryController.js";
const router = Router();
router.get("/categories",tokenAuth, index);
router.post("/category-store",tokenAuth, store);
router.patch("/category-update/:slug",tokenAuth, update);
router.delete("/category-delete/:slug",tokenAuth, destroy);
router.patch("/change-category-status/:slug",tokenAuth, changeStatus);




export default router;
